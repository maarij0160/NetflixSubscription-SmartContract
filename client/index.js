import Web3 from 'web3';
import contractConfig from '../build/contracts/NetflixSubscription.json';
import subscribed from './subscribed.html';



const owner = '0xb0e6daDfc2723b9878E39C51fa697c4aD0139b61';
const CONTRACT_ADDRESS = '0x4edCCad8Db81A9fb4AbE9A90589B5Ccb2CFe31f3'
const CONTRACT_ABI = contractConfig.abi;


const createElementFromString = (string) => {
    const el = document.createElement('div');
    el.innerHTML = string;
    return el.firstChild;
};





const web3 = new Web3(window.ethereum);


  const contract = new web3.eth.Contract(
    CONTRACT_ABI,
    CONTRACT_ADDRESS
  );

const accountEl = document.getElementById('account');
const plansEl = document.getElementById('plans');

const subscribeToPlan = async (planIndex, planPrice) => {

    const subevent = contract.events.SubscriptionPurchased();
    const alreadysub = contract.events.AlreadySubscribed();
    console.log(CONTRACT_ADDRESS);

    try {
        console.log(planIndex, planPrice);

        //const gas = await contract.methods.subscribe(planIndex).estimateGas({ from: account, value: Number(planPrice)});
        const receipt = await contract.methods.subscribe(planIndex).send({ from: account, value: Number(planPrice)});
        console.log("Transaction receipt:", receipt);

        subevent.on('data', (event) => {
            
            console.log("Subscription successful");
            console.log(event)
            alert("Subscription Purchased by User " + event.returnValues[0] + " for plan " + (Number(event.returnValues[1]) + 1) + " with amount " + (Number(event.returnValues[2]) / 1e18) + " ETH")
            window.location.assign(subscribed);
            
        });

       
        alreadysub.on('data', (event) => {
            console.log("Subscription already exists");
            console.log(event)
            alert("Subscription already exists for User " + event.returnValues[0])
            window.location.assign(subscribed);
            //alert("Subscription Purchase by User" + event.returnValues.user + "for Plan" + event.returnValues.planIndex + "with amount" + event.returnValues.amount + "at" + event.returnValues.timestamp);
            
        });

       
    } catch (error) {
        console.error("Error:", error);
        console.log("Subscription failed");
        alert("User already Subscribed to the Plan or Transaction failed due to insufficient funds");
       
    }
};


let account = ''; 

const refreshPlans = async () => {
    plansEl.innerHTML = '';

    
    for (let i = 0; i < 7; i++) {
    const plan = await contract.methods.plans(i).call();
    console.log("plans" + plans)
    
            const planEl = createElementFromString(
                `<div class="plancard" style="width: 18rem;">
                    <div class="card-body">
                        <h5 class="card-title">Plan ${i + 1}</h5>
                        <p class="card-text">${plan.durationInMonths} Month(s) - ${Number(plan.price) / 1e18} ETH</p>
                        <button class="btn btn-primary">Subscribe</button>
                    </div>
                </div>`
            );
            planEl.onclick = () => subscribeToPlan(i, plan.price);
            plansEl.appendChild(planEl);
       
    }
};

const withdrawAmountFunction = async (amount) => {

    successfulwithdraw = contract.events.SuccessfullWithdrawal();
    if (amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }
    
    try {
        //const gas = await contract.methods.withdrawFunds(Number(amount) * 1e18).estimateGas({ from: account });
        const receipt = await contract.methods.withdrawFunds(Number(amount) * 1e18).send({ from: account });
        successfulwithdraw.on('data', (event) => {
            
            console.log(event)
            alert("Withdrawal successful for amount " + (Number(event.returnValues[1]) / 1e18) + " ETH")
        });
    } catch (error) {
        console.error("Transaction failed:", error);
    
    
            alert("Transaction failed due to insufficient funds");
            return;
    }
    
};

const withdrawFromContract = async () => {
    
    const withdrawContainer = document.createElement('div');
    withdrawContainer.innerHTML = `
        <div class="withdraw-container">
            <input type="text" id="withdrawAmount" placeholder="Enter amount to withdraw" />
            <button id="withdrawButton" class="btn btn-primary">Withdraw</button>
        </div>
    `;
    
    document.body.appendChild(withdrawContainer);
    
    const withdrawButton = document.getElementById('withdrawButton');

    withdrawButton.addEventListener('click', () => {
        const withdrawAmountInput = document.getElementById('withdrawAmount');
        const withdrawAmount = withdrawAmountInput.value;
        withdrawAmountInput.value = ''; 
        withdrawAmount && withdrawAmount.trim() !== '' && withdrawAmountFunction(withdrawAmount);
    });
};


const main = async () => {

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    console.log(account);

    
    
    accountEl.innerText = account;

    if(account.toLowerCase() === owner.toLowerCase()){
        
        await withdrawFromContract();
       
    }
    else{
        await refreshPlans();
    }
    
};

main();


