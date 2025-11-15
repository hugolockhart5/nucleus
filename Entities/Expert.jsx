{
  "name": "Expert",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "Reference to User entity"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected",
        "suspended"
      ],
      "default": "pending",
      "description": "Application status"
    },
    "positioning": {
      "type": "string",
      "description": "One-line expert positioning"
    },
    "bio": {
      "type": "string",
      "description": "Detailed background"
    },
    "expertise_areas": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Domain expertise tags (e.g., pricing, growth, product)"
    },
    "example_problems": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Concrete micro-problems they can solve"
    },
    "rate_10min": {
      "type": "number",
      "description": "Price for 10-minute session in GBP"
    },
    "rate_20min": {
      "type": "number",
      "description": "Price for 20-minute session in GBP"
    },
    "linkedin_url": {
      "type": "string"
    },
    "portfolio_url": {
      "type": "string"
    },
    "years_experience": {
      "type": "number"
    },
    "availability_slots": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "day": {
            "type": "string"
          },
          "start_time": {
            "type": "string"
          },
          "end_time": {
            "type": "string"
          }
        }
      },
      "description": "Weekly availability windows"
    },
    "accept_asap_calls": {
      "type": "boolean",
      "default": false
    },
    "timezone": {
      "type": "string",
      "default": "Europe/London"
    },
    "total_sessions": {
      "type": "number",
      "default": 0
    },
    "average_rating": {
      "type": "number",
      "default": 0
    },
    "nps_score": {
      "type": "number",
      "default": 0
    }
  },
  "required": [
    "user_id",
    "positioning",
    "expertise_areas"
  ]
}
