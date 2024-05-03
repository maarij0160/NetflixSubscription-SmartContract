// SPDX-License-Identifier: GPL-3.0
pragma solidity ^ 0.8.19;


contract NetflixSubscription {
    address public owner;
    uint256 public totalSubscribers;
    mapping(address => bool) public subscribers;

    event SubscriptionPurchased(address indexed subscriber, uint256 planIndex, uint256 amount);
    event AlreadySubscribed(address indexed subscriber);
    event SuccessfullWithdrawal(address indexed owner, uint256 amount);

    struct Plan {
        uint256 durationInMonths;
        uint256 price;
    }

    Plan[] public plans;

    constructor() {
    owner = msg.sender;

    plans.push(Plan(1, 100000000000000000)); 

    plans.push(Plan(2, 200000000000000000)); 

    plans.push(Plan(3, 300000000000000000)); 

    plans.push(Plan(6, 500000000000000000)); 

    plans.push(Plan(12, 900000000000000000)); 

    plans.push(Plan(24, 1600000000000000000)); 

    plans.push(Plan(36, 2500000000000000000)); 
}


    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }



    function subscribe(uint256 planIndex) external payable {

        require(planIndex < plans.length && planIndex >= 0, "Invalid plan index");
        Plan memory selectedPlan = plans[planIndex];
        require(msg.value >= selectedPlan.price, "Insufficient payment");
        // require(!subscribers[msg.sender], "Already subscribed");

       
       if (subscribers[msg.sender]) {
        
        emit AlreadySubscribed(msg.sender);
        require(!subscribers[msg.sender], "Already subscribed");
    }

    
    subscribers[msg.sender] = true;   
    totalSubscribers++;

    
    emit SubscriptionPurchased(msg.sender, planIndex, msg.value);

    }


  function withdrawFunds(uint256 _amount) external onlyOwner {
    require(_amount <= address(this).balance, "Insufficient balance");
    payable(owner).transfer(_amount);
    emit SuccessfullWithdrawal(owner, _amount);
}





}
