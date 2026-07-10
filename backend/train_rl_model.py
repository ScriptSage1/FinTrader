import os
import torch
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np
import random

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"⚡ Compute Device Selected: {device.type.upper()}")

class DQN(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(4, 64), nn.ReLU(),
            nn.Linear(64, 64), nn.ReLU(),
            nn.Linear(64, 3) 
        )
    def forward(self, x):
        return self.net(x)

class TradingEnv:
    def __init__(self, data):
        self.data = data
        self.current_step = 0
        self.balance = 10000.0
        self.shares = 0
        self.net_worth = 10000.0
        
    def reset(self):
        self.current_step = 0
        self.balance = 10000.0
        self.shares = 0
        self.net_worth = 10000.0
        return self._get_state()
        
    def _get_state(self):
        price = self.data[self.current_step]
        return torch.FloatTensor([price/1000, self.balance/10000, self.shares/100, self.net_worth/10000]).to(device)
        
    def step(self, action):
        price = self.data[self.current_step]
        prev_net_worth = self.net_worth
        
        if action == 1 and self.balance >= price: 
            self.balance -= price
            self.shares += 1
        elif action == 2 and self.shares > 0: 
            self.balance += price
            self.shares -= 1
            
        self.current_step += 1
        done = self.current_step >= len(self.data) - 1
        
        next_price = self.data[self.current_step]
        self.net_worth = self.balance + (self.shares * next_price)
        reward = self.net_worth - prev_net_worth
        
        return self._get_state(), reward, done

print("\n🤖 Initializing Deep RL Training on GPU...")

model = DQN().to(device)
optimizer = optim.Adam(model.parameters(), lr=0.001)
criterion = nn.MSELoss()

gamma = 0.95        
epsilon = 1.0       
epsilon_min = 0.05  
epsilon_decay = 0.97 

csv_files = [f for f in os.listdir("data") if f.endswith(".csv")]
epochs = 200 

for epoch in range(epochs):
    total_reward = 0
    
    for file in csv_files:
        df = pd.read_csv(os.path.join("data", file))
        prices = df["Close"].values
        env = TradingEnv(prices)
        state = env.reset()
        done = False
        
        while not done:
            if random.random() <= epsilon:
                action = random.randint(0, 2)
            else:
                with torch.no_grad():
                    q_values = model(state)
                    action = torch.argmax(q_values).item()
                    
            next_state, reward, done = env.step(action)
            total_reward += reward
            
            target = reward
            if not done:
                with torch.no_grad():
                    target = reward + gamma * torch.max(model(next_state)).item()
                    
            current_q = model(state)[action]
            target_tensor = torch.tensor(target, dtype=torch.float32, device=device)
            
            loss = criterion(current_q, target_tensor)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            state = next_state
            
    epsilon = max(epsilon_min, epsilon * epsilon_decay)
    
    if (epoch + 1) % 10 == 0:
        print(f"Epoch {epoch+1}/{epochs} | Total Net Reward: {total_reward:.2f} | Epsilon: {epsilon:.2f}")

torch.save(model.state_dict(), "trading_model.pth")
print("\n🎉 Deep RL Training Complete. 'trading_model.pth' saved.")

def evaluate_model(model_path, data_dir="data"):
    print("\n📊 Starting Model Evaluation...")
    eval_model = DQN().to(device)
    eval_model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
    eval_model.eval()
    
    csv_files = [f for f in os.listdir(data_dir) if f.endswith(".csv")]
    total_portfolio_profit = 0
    
    for file in csv_files:
        print(f"\n--- Evaluating on {file} ---")
        df = pd.read_csv(os.path.join(data_dir, file))
        prices = df["Close"].values
        
        env = TradingEnv(prices)
        state = env.reset()
        done = False
        
        buy_count, sell_count, hold_count = 0, 0, 0
        
        while not done:
            with torch.no_grad():
                q_values = eval_model(state)
                action = torch.argmax(q_values).item()
                
            if action == 1: buy_count += 1
            elif action == 2: sell_count += 1
            else: hold_count += 1
                
            next_state, reward, done = env.step(action)
            state = next_state
            
        initial_balance = 10000.0
        profit = env.net_worth - initial_balance
        roi = (profit / initial_balance) * 100
        total_portfolio_profit += profit
        
        print(f"Final Net Worth: ${env.net_worth:.2f}")
        print(f"Stock Profit:    ${profit:.2f} ({roi:.2f}%)")
        print(f"Decisions:       BUYS: {buy_count} | SELLS: {sell_count} | HOLDS: {hold_count}")

    print("\n========================================")
    print(f"🏆 Total Simulated Profit Across All Assets: ${total_portfolio_profit:.2f}")
    print("========================================")

evaluate_model("trading_model.pth")