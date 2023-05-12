## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Routes

### Publishers

---

- POST /publisher
- Role: Admin
- Request

```json
{
  "email": "string"
}
```

- Response:
  - 200 Ok
  - 400 Bad Request (e.g. invalid email)

---

- GET /publisher
- Role: Admin
- Response:

```json
{
  "data": [
    {
      "id": "string",
      "email": "string",
      "clicksAmount": "number",
      "leadsAmount": "number"
    }
  ]
}
```

---

- GET /publisher/:id
- Role: Admin
- Query
  - year: number (default current year)
  - statType: string (click, leads, ratio) (default click)
- Description: Allows admin to get basis information and stats about a specific publisher
- Response:

```json
{
  "data": {
    "id": "string",
    "email": "string",
    "campaigns": [
      {
        "id": "string",
        "platform": {
          "id": "string",
          "name": "string",
          "url": "string"
        },
        "path": "string",
        "createdAt": "Date",
        "totalConvertedClicks": "number",
        "totalConvertedLeads": "number",
        "stats": [
          {
            "type": "string",
            "dataset": ["number"]
          }
        ]
      }
    ]
  }
}
```

### Campaigns

---

- POST /campaign
- Role: Publisher
- Description: Allows a publisher to create a new campaign.
- Request:

```json
{
  "platformId": "number",
  "path": "string"
}
```

- Response:
  - 201 Created
  - 404 Not Found (platformId not found)
  - 400 Bad Request (invalid path)

---

- GET /campaign/:id
- Role: Publisher / Admin
- Description: Allows a publisher or admin to get statistics about the campaign
- query
  - year (default current year)
  - statType: string (click, leads, ratio) (default click)
- Response:

```json
{
  "data": {
    "id": "string",
    "platform": {
      "id": "string",
      "name": "string",
      "baseUrl": "string"
    },
    "createdAt": "date",
    "totalConvertedClicks": "number",
    "totalConvertedLeads": "number",
    "stats": [
      {
        "type": "string",
        "dataset": ["number"]
      }
    ]
  }
}
```

- Response:
  - 201 Created
  - 404 Not Found (platformId not found)
  - 400 Bad Request (invalid path)

---

- GET /stats
- Role: Publisher
- Description: Allows a publisher to get stats across all his campaigns
- query
  - year (default current year)
  - statType: string (click, leads, ratio) (default click)
- Response:

```json
{
  "data": {
    "totalConvertedClicks": "number",
    "totalConvertedLeads": "number",
    "stats": [
      {
        "type": "string",
        "dataset": ["number"]
      }
    ]
  }
}
```

- Response:
  - 200 Ok
  - 400 Bad Request

## Entities

Publisher:

- id: string
- email: string
- createdAt: string
- active: boolean

Campagin:

- id: string
- path: string
- platformId: string
- publisherId: string
- createdAt: Date

ConsumerAction

- id: string
- createdAt: string
- actionType: Enum (CLICK | LEAD)
- campaignId: string

Platform:

- id: string
- name: string
- baseUrl: string
