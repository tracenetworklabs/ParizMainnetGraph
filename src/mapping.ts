import { Address, BigInt, Bytes, DataSourceTemplate } from "@graphprotocol/graph-ts";
import {
  VenueAdded,
  VenueFeesUpdated
} from "../generated/Venue/Venue";

import {
  Erc20Details as Erc20DetailsEvent,
  Erc721Details as Erc721DetailsEvent,
  conversion as conversionContractAddress
} from "../generated/conversion/conversion";

import { VenueList, EventList, WhiteList, Erc20TokenEvent, Favourite, 
  BookedTime, VenueRental, PlatformFee, IsEventPublic, BaseToken, History, Agenda,
  Join, TicketBought, TicketBalance, EventTime, TicketRefund, VenueRefund, EventId, Erc721EventToken, Erc721UserToken, isTokenUsed, Exit } from "../generated/schema";

import {
  events as EventsContract,
  EventAdded as EventAdded,
  EventUpdated,
  Featured as FeaturedEvent,
  Favourite as FavouriteEvent,
  Transfer as TransferToken,
  EventPaid,
  Joined,
  VenueFeesRefunded
} from "../generated/events/events";

import {
  admin as adminContract,
  WhiteList as WhiteListEvent,
  Erc20TokenUpdated as Erc20TokenUpdatedEvent,
  Erc721TokenUpdated as Erc721TokenUpdatedEvent,
  PlatformFeeUpdated as PlatformFeeUpdated,
  EventStatusUpdated,
  VenueRentalCommissionUpdated,
  BaseTokenUpdated
} from "../generated/admin/admin";

// import {
//   DataAdded
// } from "../generated/history/history";

import {
  AgendaAdded,
  AgendaUpdated,
  AgendaDeleted,
  EventStarted,
  EventCancelled,
  EventEnded,
  TicketFeesRefund as TicketRefundEvent,
  EventCompleted,
  Exited
} from "../generated/manageEvent/manageEvent";

import {
  Bought,
  ticketMaster as TicketMasterContract
} from "../generated/ticketMaster/ticketMaster";

import {
  Transfer as TransferTicket
} from "../generated/templates/ticket/ticket";

import {
  ticket as TicketTokenContract
} from "../generated/templates/ticket/ticket";

import {
  ticket as TicketNFTContract
} from "../generated/templates";


export function handleEventAdded(event: EventAdded): void {
  let token = EventList.load(event.params.tokenId.toString());
  if (!token) {
      token = new EventList(event.params.tokenId.toString());
      let contract = EventsContract.bind(event.address);
      let value = contract.getInfo(event.params.tokenId);
      token.eventTokenId = event.params.tokenId;
      token.venueTokenId = event.params.venueTokenId;
      token.eventName = value.value0;
      token.eventCategory = value.value1;
      token.eventDescription = value.value2;
      token.eventStartTime = value.value4;
      token.eventEndTime = value.value5;
      token.tokenCID = event.params.tokenCID;
      token.isVenueFeesPaid = event.params.isVenueFeesPaid;
      token.isPaid = event.params.isEventPaid;
      token.ticketPrice = event.params.ticketPrice;
      token.transactionHash = event.transaction.hash.toHexString();
      token.timestamp = event.block.timestamp;
      token.eventOrganiserAddress = event.params.eventOrganiser;
      token.isFeatured = false;
      token.participantsList = [null];
      token.ticketBoughtList = [null];
      token.ticketBalance = [null];
      
  
      token.tokenAddress = Address.fromString("0x4287F07CBE6954f9F0DecD91d0705C926d8d03A4");
      token.venueFeeAmount = event.params.venueFeeAmount;
      token.ticketNFTAddress = event.params.ticketNFTAddress;
      token.isEventCanceled = false;
      token.isEventStarted = false;
      token.isEventEnded = false;
      
      token.save();
      let tokenValue = BookedTime.load(event.params.venueTokenId.toString());
      if(!tokenValue) {
        tokenValue = new BookedTime(event.params.venueTokenId.toString());
        tokenValue.venueId = event.params.venueTokenId;
        if(tokenValue.eventTokenId.length == 0) {
          let eventTokenIds = tokenValue.eventTokenId;
          tokenValue.eventTokenId = eventTokenIds.concat([event.params.tokenId]);
        }
        else {
          let eventTokenIds = tokenValue.eventTokenId;
          tokenValue.eventTokenId = eventTokenIds.concat([event.params.tokenId]);   
        }
    
        if(tokenValue.eventStartTime.length == 0 ) {
          let eventStartTimes = tokenValue.eventStartTime;
          tokenValue.eventStartTime = eventStartTimes.concat([value.value4]);
        }
        else {
          let eventStartTimes = tokenValue.eventStartTime;
          tokenValue.eventStartTime = eventStartTimes.concat([value.value4]);
        }
    
        if(tokenValue.eventEndTime.length== 0 ) {
          let eventEndTimes = tokenValue.eventEndTime;
          tokenValue.eventEndTime = eventEndTimes.concat([value.value5]);
        }
        else {
          let eventEndTimes = tokenValue.eventEndTime;
          tokenValue.eventEndTime = eventEndTimes.concat([value.value5]);
        }
      }
    
      else {
        tokenValue = BookedTime.load(event.params.venueTokenId.toString());
        if(tokenValue.eventTokenId.length == 0) {
          let eventTokenIds = tokenValue.eventTokenId;
          tokenValue.eventTokenId = eventTokenIds.concat([event.params.tokenId]);
        }
        else {
          let eventTokenIds = tokenValue.eventTokenId;
          tokenValue.eventTokenId = eventTokenIds.concat([event.params.tokenId]);   
        }
    
        if(tokenValue.eventStartTime.length == 0 ) {
          let eventStartTimes = tokenValue.eventStartTime;
          tokenValue.eventStartTime = eventStartTimes.concat([value.value4]);
        }
        else {
          let eventStartTimes = tokenValue.eventStartTime;
          tokenValue.eventStartTime = eventStartTimes.concat([value.value4]);
        }
    
        if(tokenValue.eventEndTime.length== 0 ) {
          let eventEndTimes = tokenValue.eventEndTime;
          tokenValue.eventEndTime = eventEndTimes.concat([value.value5]);
        }
        else {
          let eventEndTimes = tokenValue.eventEndTime;
          tokenValue.eventEndTime = eventEndTimes.concat([value.value5]);
        }
      }
      TicketNFTContract.create(event.params.ticketNFTAddress);
      let tokenTime = EventTime.load(event.params.tokenId.toString());
      if(!tokenTime) {
        tokenTime = new EventTime(event.params.tokenId.toString());
        tokenTime.eventTokenId = event.params.tokenId;
        tokenTime.eventStartTime = value.value4;
        tokenTime.eventEndTime = value.value5;
        tokenTime.venueId = event.params.venueTokenId;
        tokenTime.isEventCanceled = false;
      }
      tokenTime.save();
      let tokenTimes = tokenValue.times;
      tokenValue.times = tokenTimes.concat([tokenTime.id]);
      tokenValue.save();
      let tokenValues = EventId.load(event.params.ticketNFTAddress.toString());
      if(!tokenValues) {
        tokenValues = new EventId(event.params.ticketNFTAddress.toString());
        tokenValues.ticketNFTAddress = event.params.ticketNFTAddress;
        tokenValues.eventId = event.params.tokenId;
      }
      tokenValues.save();
    }
}

export function handleTimeUpdated(event: EventUpdated): void {
  let token = EventList.load(event.params.tokenId.toString());
  if(token) {
    token.eventTokenId = event.params.tokenId;
    token.eventStartTime = event.params.startTime;
    token.eventEndTime = event.params.endTime;
    token.eventDescription = event.params.description;
    token.venueFeeAmount = event.params.venueFeeAmount;
  }
  token.save();
  let tokenTime = EventTime.load(event.params.tokenId.toString());
  if(tokenTime) {
    tokenTime.eventTokenId = event.params.tokenId;
    tokenTime.eventStartTime =  event.params.startTime;
    tokenTime.eventEndTime = event.params.endTime;
  }
  let tokenValue = BookedTime.load(tokenTime.venueId.toString());
  let tokenTimes = tokenValue.times;
  tokenValue.times = tokenTimes.concat([tokenTime.id]);

  tokenTime.save();
  tokenValue.save();
  token.save();
}

export function handleFeatured(event: FeaturedEvent): void {
  let token = EventList.load(event.params.tokenId.toString());
  if(token) {
    token.eventTokenId = event.params.tokenId;
    token.isFeatured = event.params.isFeatured;
  }
  token.save();
}

export function handleFavourite(event: FavouriteEvent): void {
  let token = Favourite.load(event.params.user.toString() + event.params.tokenId.toString());
  if(!token){
    token = new Favourite(event.params.user.toString() + event.params.tokenId.toString());
    token.userAddress = event.params.user;
    token.eventTokenId = event.params.tokenId;
    token.isFavourite = event.params.isFavourite;
  }
  else {
    token.isFavourite = event.params.isFavourite;
  }
  token.save();
}

export function handleEventPaid(event: EventPaid): void {
  let token = EventList.load(event.params.eventTokenId.toString());
  if(token) {
    token.isVenueFeesPaid = event.params.payNow;
    token.venueFeeAmount = event.params.venueFeeAmount;
  }
  token.save();
}

export function handleVenueRefund(event: VenueFeesRefunded): void{
  let token = VenueRefund.load(event.params.eventTokenId.toString());
  if(!token) {
    token = new VenueRefund(event.params.eventTokenId.toString());
    token.eventTokenId = event.params.eventTokenId;
    token.eventOrganiser = event.params.eventOrganiser;
    token.refundStatus = true;
  }
  token.save();
}

export function handleJoined(event: Joined): void {
  let token = Join.load(event.params.tokenId.toString() + event.params.ticketId.toString() + event.params.user.toString());
  if(!token) {
    token = new Join(event.params.tokenId.toString() +  event.params.ticketId.toString() + event.params.user.toString());
    token.eventTokenId = event.params.tokenId;
    token.userAddress = event.params.user;
    token.joinTime = event.params.joiningTime;
    token.ticketId = event.params.ticketId;
    token.isJoined = true;
  }
  else {
    token.joinTime = event.params.joiningTime;
    token.userAddress = event.params.user;
    token.isJoined = true;
  }
  let contract = EventsContract.bind(event.address);
  let nftAddress = contract.ticketNFTAddress(event.params.tokenId);
  let ticketBalance = TicketBalance.load(nftAddress.toString() + event.params.ticketId.toString());
  ticketBalance.isUsed = true;
  let tokenValue = EventList.load(event.params.tokenId.toString());
  if(tokenValue) {
    let userAddress = tokenValue.participantsList;
    tokenValue.participantsList = userAddress.concat([token.id]);
  }
  token.save();
  tokenValue.save();
}

/******************************************************* Admin Functions **********************************************************/


export function handleWhiteList(event: WhiteListEvent): void {
  let token = WhiteList.load(event.params.whitelistedAddress.toString());
  if(!token) {
    token = new WhiteList(event.params.whitelistedAddress.toString());
    token.userAddress = event.params.whitelistedAddress;
    token.status = event.params.status;
  }
  else{
    token.userAddress = event.params.whitelistedAddress;
    token.status = event.params.status;
  }
  token.save();
}

export function handleErc20TokenUpdatedEvent(event: Erc20TokenUpdatedEvent): void {
  let tokenDetail = Erc20TokenEvent.load(event.params.tokenAddress.toString());
  if(!tokenDetail) {
    tokenDetail = new Erc20TokenEvent(event.params.tokenAddress.toString());
    tokenDetail.tokenAddress = event.params.tokenAddress;
    tokenDetail.status = event.params.status;
    tokenDetail.tokenName = event.params.name;
    tokenDetail.tokenSymbol = event.params.symbol;
    tokenDetail.tokenDecimal = event.params.decimal;
  }
  else {
    tokenDetail.status = event.params.status;
    tokenDetail.tokenAddress = event.params.tokenAddress;
  }
  tokenDetail.save();
}

export function handleErc721TokenUpdatedEvent(event: Erc721TokenUpdatedEvent): void {
  let tokenDetail = Erc721EventToken.load(event.params.tokenAddress.toString() + event.params.eventTokenId.toString());
  if(!tokenDetail) {
    tokenDetail = new Erc721EventToken(event.params.tokenAddress.toString() + event.params.eventTokenId.toString());
    tokenDetail.tokenAddress = event.params.tokenAddress;
    tokenDetail.status = event.params.status;
    tokenDetail.freePass = event.params.freePassStatus;
    tokenDetail.eventTokenId = event.params.eventTokenId;
    tokenDetail.tokenName = event.params.name;
    tokenDetail.tokenSymbol = event.params.symbol;
    tokenDetail.tokenDecimal = event.params.decimal.toString();

  }
  else {
    tokenDetail.status = event.params.status;
    tokenDetail.freePass = event.params.freePassStatus;
  }
  
  tokenDetail.save();
}

export function handlePlatformFee(event: PlatformFeeUpdated): void {
  let token = PlatformFee.load(event.params.platformFeePercent.toString());
  if(!token){
    token = new PlatformFee(event.params.platformFeePercent.toString());
    token.PlatformFeePercent = event.params.platformFeePercent;
  }
  else {
    token.PlatformFeePercent = event.params.platformFeePercent;
  }
  token.save();
}


export function handleEventStatus(event: EventStatusUpdated): void {
  let token = IsEventPublic.load(event.address.toString());
  if(!token){
    token = new IsEventPublic(event.address.toString());
    token.eventStatus = event.params.isPublic;
    token.eventContract = event.address;
  }
  else {
    token.eventStatus = event.params.isPublic;
  }
  token.save();
}

export function handleRentalCommission(event: VenueRentalCommissionUpdated): void {
  let token = VenueRental.load(event.params.venueRentalCommission.toString());
  if(!token) {
    token = new VenueRental(event.params.venueRentalCommission.toString());
    token.venueRentalCommission = event.params.venueRentalCommission;
  }
  else {
    token.venueRentalCommission = event.params.venueRentalCommission;
  }
  token.save();
}

export function handleBaseTokenUpdated(event: BaseTokenUpdated): void {
  let token = BaseToken.load(event.params.baseTokenAddress.toString());
  if(!token){
    token = new BaseToken(event.params.baseTokenAddress.toString());
    token.baseTokenAddress = event.params.baseTokenAddress;
    token.tokenName = event.params.name;
    token.tokenSymbol = event.params.symbol;
    token.tokenDecimal = event.params.decimal;
    
  }
  token.save();
}

/******************************* Venue Functions  *******************************************/

export function handleVenueAdded(event: VenueAdded): void {
  let entity = VenueList.load(event.params.tokenId.toHex());
  if (!entity) {
    entity = new VenueList(event.params.tokenId.toHex());
    entity.name = event.params.name;
    entity.location = event.params.location;
    entity.category = event.params.category;
    entity.totalCapacity = event.params.totalCapacity;
    entity.rentPerBlock = event.params.rentPerBlock;
    entity.tokenCID = event.params.tokenCID;
    entity.venueId = event.params.tokenId;
    entity.transactionHash = event.transaction.hash.toHex();
    entity.timestamp = event.block.timestamp;
    let token = BookedTime.load(event.params.tokenId.toString());
    if(!token) {
      token = new BookedTime(event.params.tokenId.toString());
      token.name = event.params.name;
      token.location = event.params.location;
      token.category = event.params.category;
      token.totalCapacity = event.params.totalCapacity;
      token.rentPerBlock = event.params.rentPerBlock;
      token.tokenCID = event.params.tokenCID;
      token.venueId = event.params.tokenId;
      token.transactionHash = event.transaction.hash.toHex();
      token.timestamp = event.block.timestamp;
      token.times = [null];
    }
    token.save();
  }

  entity.save();
}

export function handleVenueFeesUpdated(event: VenueFeesUpdated): void {
  let token = VenueList.load(event.params.tokenId.toHex());
  if(token) {
    token.rentPerBlock = event.params.rentPerBlock;
    token.venueId = event.params.tokenId;
  }
  let tokenValue = BookedTime.load(event.params.tokenId.toString());
  if(tokenValue) {
    tokenValue.rentPerBlock = event.params.rentPerBlock;
    tokenValue.transactionHash = event.transaction.hash.toHex();
    tokenValue.timestamp = event.block.timestamp;
  }
 tokenValue.save();
 token.save();

}

/******************************* Manage Event Functions  *******************************************/

export function handleAgendaAdded(event: AgendaAdded): void {
  let token = Agenda.load(event.params.eventTokenId.toString() + event.params.agendaId.toString());
  if(!token) {
     token = new Agenda(event.params.eventTokenId.toString() + event.params.agendaId.toString());
     token.agendaId = event.params.agendaId;
     token.eventTokenId = event.params.eventTokenId;
     token.agendaStartTime = event.params.agendaStartTime;
     token.agendaEndTime = event.params.agendaEndTime;
     token.agendaName = event.params.agendaName;
     token.guestName = event.params.guestName;
     token.agendaStatus = "Agenda Added";
     token.guestAddress = event.params.guestAddress;
     token.initiateStatus = event.params.initiateStatus;
     token.isAgendaDeleted = false;
  }
  token.save();
}

export function handleAgendaUpdated(event: AgendaUpdated): void {
  let token = Agenda.load(event.params.eventTokenId.toString() + event.params.agendaId.toString());
  if(token) {
     token.agendaId = event.params.agendaId;
     token.eventTokenId = event.params.eventTokenId;
     token.agendaStartTime = event.params.agendaStartTime;
     token.agendaEndTime = event.params.agendaEndTime;
     token.agendaName = event.params.agenda;
     token.guestName = event.params.guestName;
     token.agendaStatus = "Agenda Updated";
     token.guestAddress = event.params.guestAddress;
     token.initiateStatus = event.params.initiateStatus;
  }
  token.save();

}

export function handleAgendaDeleted(event: AgendaDeleted): void {
  let token = Agenda.load(event.params.eventTokenId.toString() + event.params.agendaId.toString());
  if(token) {
     token.agendaId = event.params.agendaId;
     token.eventTokenId = event.params.eventTokenId;
     token.isAgendaDeleted = event.params.deletedStatus;
  }
  token.save();

}

export function handleEventStarted(event: EventStarted): void {
  let token = EventList.load(event.params.eventTokenId.toString());
  if(token) {
    token.isEventStarted = true;
  }
  token.save();
}

export function handleEventCompleted(event : EventCompleted): void {
  let token = EventList.load(event.params.eventTokenId.toString());
  if(token) {
    token.isEventCompleted = true;
  }
  token.save();
}

export function handleEventExited(event: Exited): void {
  let token = Join.load(event.params.tokenId.toString() + event.params.ticketId.toString() + event.params.user.toString());
  let tokenValue = Exit.load(event.params.tokenId.toString() + event.params.ticketId.toString() + event.params.user.toString());
  if(!tokenValue) {
    tokenValue = new Exit(event.params.tokenId.toString() + event.params.ticketId.toString() + event.params.user.toString());
    tokenValue.eventTokenId = event.params.tokenId;
    tokenValue.userAddress = event.params.user;
    tokenValue.leavingTime = event.params.leavingTime;
    tokenValue.ticketId = event.params.ticketId;
  }
  tokenValue.save();
  if(token) {
    token.isJoined = false;
    token.save();
  }
  
}

export function handleCanceledEvent(event: EventCancelled): void {
  let token = EventList.load(event.params.eventTokenId.toString());
  if(token) {
    token.isEventCanceled = true;
    token.canceledTime = event.block.timestamp;
  }
  let times = EventTime.load(event.params.eventTokenId.toString());
  if(times) {
    times.isEventCanceled = true;
  }
  times.save();
  token.save();
}

export function handleEventEnded(event: EventEnded): void {
  let token = EventList.load(event.params.eventTokenId.toString());
  if(token) {
    token.isEventEnded = true;
  }
  token.save();
}

export function handleTicketRefund(event: TicketRefundEvent): void{
  let token = TicketRefund.load(event.params.eventTokenId.toString() + event.params.ticketId.toString());
  if(!token) {
    token = new TicketRefund(event.params.eventTokenId.toString() + event.params.ticketId.toString());
    token.eventTokenId = event.params.eventTokenId;
    token.ticketId = event.params.ticketId;
    token.userAddress = event.params.user;
    token.refundStatus = true;
  }
  token.save();
}

/*********************************** TicketMaster Functions ******************************************/

export function handleTicketBought(event: Bought): void {
  let token = TicketBought.load(event.params.tokenId.toString() + event.params.ticketId.toString());
  if(!token) {
    token = new TicketBought(event.params.tokenId.toString() + event.params.ticketId.toString());
    token.eventTokenId = event.params.tokenId;
    token.userAddress = event.params.buyer;
    token.ticketId = event.params.ticketId;
    token.tokenAddress = event.params.tokenAddress;
    token.ticketFeeAmount = event.params.tokenAmount;
    
  }
  let tokenValue = EventList.load(event.params.tokenId.toString());
  if(tokenValue) {
    let userAddress = tokenValue.ticketBoughtList;
    tokenValue.ticketBoughtList = userAddress.concat([token.id]);
  }
  let contract = TicketMasterContract.bind(event.address);
  let nftAddress = contract.ticketNFTAddress(event.params.tokenId);
  let tokenValues2 = TicketBalance.load(nftAddress.toString() + event.params.ticketId.toString());
  if(tokenValues2) {
    tokenValues2.tokenAddress = event.params.tokenAddress;
    tokenValues2.ticketFeeAmount = event.params.tokenAmount;
    tokenValues2.eventTokenId = event.params.tokenId;
  }
  
  let tokenIdUsed = isTokenUsed.load(event.params.tokenAddress.toString() + event.params.tokenAmount.toString()); 
  if(!tokenIdUsed) {
    tokenIdUsed =  new isTokenUsed(event.params.tokenAddress.toString() + event.params.tokenAmount.toString());
    tokenIdUsed.nftContractAddress = event.params.tokenAddress;
    tokenIdUsed.tokenID = event.params.tokenAmount;
    tokenIdUsed.isUsed = true;
    tokenIdUsed.save();
  }
  tokenValues2.save();
  tokenValue.save();
  token.save();

}

/*************************************** Ticket Transfer Contract ************************************************/

export function handleTicketTransfer(event: TransferTicket): void {
  let token = TicketBalance.load(event.address.toString() + event.params.tokenId.toString());
  if(!token) {
    token = new TicketBalance(event.address.toString() + event.params.tokenId.toString());
    token.ticketId = event.params.tokenId;
    token.ownerAddress = event.params.to;
    token.from = event.params.from;
    token.ticketNFTAddress = event.address; 
    token.isUsed = false;
  }
  else {
    token.from = event.params.from;
    token.ownerAddress = event.params.to;
    token.isUsed = false;
  }
  let tokenValues = EventId.load(event.address.toString());
  let contract = TicketTokenContract.bind(event.address);
  token.balance = contract.balanceOf(event.params.to);
  let eventList = EventList.load(tokenValues.eventId.toString());
  let balance = eventList.ticketBalance;
  eventList.ticketBalance = balance.concat([token.id]);
  
  tokenValues.save();
  eventList.save();

  token.save();
}

