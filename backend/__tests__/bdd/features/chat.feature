Feature: Chat Controller
  As a user (client or admin)
  I want to access chat rooms and messages
  So that I can communicate

  Scenario: Client retrieves their chat messages
    Given I am a logged in client with ID 1
    And the chat room 10 exists with messages
    When I request messages for room 10
    Then I should receive a list of messages
    And the response should be successful

  Scenario: Admin retrieves chat rooms
    Given I am a logged in admin with Shop ID 1
    And there are chat rooms for this shop
    When I request the list of chat rooms
    Then I should receive a list of rooms associated with the shop
