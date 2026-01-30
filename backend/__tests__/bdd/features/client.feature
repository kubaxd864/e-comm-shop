Feature: Client Controller
  As a client
  I want to access and manage my account information, favorites, and orders
  So that I can control my shopping experience

  Background:
    Given I am a logged-in user

  Scenario: Client retrieves information about their account
    When I request my account information
    Then I should receive my user details including name, email, and role

  Scenario: Client updates profile information successfully
    When I update my profile with: name, surname, city
    Then the response should indicate success with message "Dane zaktualizowano pomyślnie"

  Scenario: Client changes password successfully
    Given my current password is "oldPassword123"
    When I change my password from "oldPassword123" to "newPassword456"
    Then the response should indicate "Zmieniono hasło"

  Scenario: Client fails to change password with incorrect old password
    Given my current password is "oldPassword123"
    When I change my password from "wrongPassword" to "newPassword456"
    Then the response status should be 400
    And the response should contain message "Niepoprawne aktualne hasło"

  Scenario: Client fails to change password when new password is same as old
    Given my current password is "password123"
    When I change my password from "password123" to "password123"
    Then the response status should be 400
    And the response should contain message "Nowe hasło nie może być takie samo jak stare"

  Scenario: Client adds a product to favorites
    Given a product with ID 10 exists
    When I add product 10 to my favorites
    Then the response status should be 201
    And the response should contain message "Dodano do Ulubionych"

  Scenario: Client retrieves favorite products
    Given I have products in my favorites
    When I request my favorite products
    Then I should receive a list of favorite products

  Scenario: Client removes a product from favorites
    Given product 10 is in my favorites
    When I remove product 10 from my favorites
    Then the response should indicate "Usunięto z Ulubionych"

  Scenario: Client retrieves their orders
    Given I have placed orders
    When I request my orders
    Then I should receive a list of my orders with items