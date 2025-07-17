# CALMe

**Crisis-Aware Language Model for Emergency Support**

CALMe is an offline-first web application prototype designed to provide immediate psychological first aid during crisis situations. This project is being developed as part of a hackathon focused on supporting the Israeli population's resilience during ongoing conflict.

## Project Overview

During crisis situations like rocket attacks and terror incidents, civilians need immediate trauma support but often face overwhelmed emergency services and compromised network infrastructure. CALMe addresses this gap by providing trauma-informed crisis support that works completely offline after initial download.

## Key Design Goals

**Offline-First Operation**
- Works completely without internet after initial setup
- All natural language processing happens locally on device
- No dependence on external services that could fail during infrastructure attacks

**Natural Language Understanding**
- Processes emotional, fragmented crisis language semantically rather than through rigid forms
- Initial support for Hebrew and English with cultural context awareness
- Arabic and additional languages planned for future releases
- Handles panic responses with therapeutic conversation flows
- Easily extensible architecture for adding new languages and cultural contexts

**Crisis-Optimized Design**
- Minimal resource requirements (works on devices with 1GB+ RAM)
- Quick loading during high-stress situations
- Silent mode operation for active danger scenarios
- Shareable via local networks during emergencies

## Technical Approach

**Architecture**
- React PWA with embedded natural language processing
- Compromise.js for local semantic text analysis
- Service Worker for complete offline functionality
- Modular, extensible design for easy addition of languages and therapeutic content
- Target size: approximately 50MB including video content

**Conversation Engine**
- Classification questions for safety assessment
- Extraction questions for gathering context
- Therapeutic response generation based on social worker input
- Progressive conversation flow: safety → stress assessment → coping activities
- Tailored conversation flows and activities based on user needs and capabilities
- Initial Hebrew/English support with extensible internationalization framework

**Distribution Strategy**
- Direct web installation as PWA
- Peer-to-peer sharing capability during emergencies
- No app store dependencies

## Development Status

This is a prototype being developed during a 12-day hackathon period by a team working in their spare time. Current development focuses on:

- Core conversation engine implementation
- Natural language parser for crisis responses  
- Offline PWA infrastructure
- Hebrew/English internationalization (Arabic and other languages planned)
- Personalized therapeutic activity components tailored to user capabilities
- User interface design and visual styling
- Extensible architecture for future language and content expansion

## Tentative Roadmap

Future development phases may include:

- **Homefront Command Integration** - Automatic activation following red alert notifications on user's device
- **Speech Input/Output** - Voice interaction for hands-free crisis support
- **Integrated Offline Screen Reader** - Built-in accessibility for visually impaired users
- **User Profiling System** - Dynamic module selection based on individual needs and capabilities
- **Specialized Accessibility Modules** - Tailored interfaces and interactions for users with different disabilities
- **Family Situation Modules** - Customized support flows for various family configurations and responsibilities
- **Extended Language Support** - Arabic and additional languages with cultural adaptation

## Documentation

- `/docs` - Current project documentation and implementation guides
- `/deprecateddocs` - Retired documentation versions

## Development Setup

**Prerequisites**
- Node.js 18+
- Modern browser with developer tools

**Quick Start**
```bash
# Clone repository
git clone https://github.com/your-org/calme.git
cd calme

# Install dependencies
npm install

# Start development server
npm run dev
```

**Available Scripts**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run test         # Run test suite
npm run verify-offline  # Verify offline functionality
```

## Technical Specifications

**Browser Support**
- Chrome 70+, Safari 11.3+, Firefox 65+
- Progressive Web App capabilities
- Service Worker support required

**Resource Requirements**
- 1GB+ available RAM
- 100MB+ storage space
- Initial network connection for setup only

**Core Technologies**
- React 18 + Vite
- Compromise.js for NLP
- react-i18next for internationalization (Hebrew/English initially)
- Service Worker API for offline functionality

## Privacy and Security

- All conversation processing occurs locally on user device
- No personal data transmitted over network after initial setup
- Conversation history stored locally only
- No user tracking or analytics
- **Complete data control**: Deleting the app removes all stored user data - no requests or procedures needed

## Project Scope and Limitations

This is a hackathon prototype focused on demonstrating core concepts:
- Offline natural language processing for crisis support
- PWA distribution model for emergency situations
- Therapeutic conversation flow implementation

The prototype aims to validate technical feasibility and therapeutic approach rather than provide a production-ready application.

## Social Worker Integration

The conversation flows and therapeutic responses are being developed in collaboration with a licensed social worker on the team. The technical implementation translates their clinical expertise into structured conversation maps, response templates, and evidence-based therapeutic protocols suitable for crisis intervention.

## License

[License information to be determined]

## Team

This project is being developed by a multidisciplinary team during a hackathon focused on Israeli population resilience:

- **Developers** - Frontend and backend implementation
- **Content Expert** - Licensed social worker providing therapeutic guidance
- **Graphic Designer** - User interface and visual design
- **Solution Architect** - Technical architecture and system design

All team members are contributing their spare time while maintaining full-time employment elsewhere.
