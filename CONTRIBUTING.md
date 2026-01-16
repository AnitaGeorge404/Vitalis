# Contributing to Vitalis

Thank you for your interest in contributing to Vitalis! This guide will help you get started.

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnitaGeorge404/Vitalis.git
   cd Vitalis
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## 📋 Branch Strategy

We use a feature-branch workflow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual feature branches
- `bugfix/bug-name` - Bug fix branches

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

- Features: `feature/cpr-coach-timer`
- Bug fixes: `bugfix/navbar-mobile-menu`
- Documentation: `docs/add-api-documentation`

## 🏗️ Project Structure

```
src/
 ├── components/        # Reusable UI components
 ├── pages/            # Main page components
 ├── emergency/        # Emergency feature pages
 ├── health/           # Health check feature pages
 └── styles/           # CSS styling files
```

## 💻 Development Workflow

1. **Pick a feature** from the project board or issues
2. **Create a feature branch** from `develop`
3. **Develop your feature** following our coding standards
4. **Test your changes** locally
5. **Commit your changes** with clear commit messages
6. **Push your branch** and create a pull request
7. **Request review** from team members

## ✍️ Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: Add CPR timer functionality
fix: Resolve navbar mobile menu issue
docs: Update installation instructions
style: Format code in FeatureCard component
refactor: Simplify routing logic
```

### Commit Message Format

```
<type>: <description>

[optional body]
[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code formatting (no logic changes)
- `refactor` - Code restructuring
- `test` - Adding or updating tests
- `chore` - Build process or auxiliary tool changes

## 🎨 Code Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Keep components small and focused
- Add JSDoc comments to component files
- Use meaningful variable and function names
- Extract repeated logic into custom hooks

### CSS

- Use CSS variables defined in `global.css`
- Follow BEM naming convention when appropriate
- Keep styles modular and component-specific
- Ensure responsive design for all screen sizes

### File Organization

- One component per file
- Co-locate styles with components when specific
- Keep component files under 200 lines when possible

## 🧪 Testing Your Changes

Before submitting a pull request:

1. Test your feature in development mode
2. Test on different screen sizes (mobile, tablet, desktop)
3. Ensure no console errors
4. Test navigation between pages
5. Build for production and test: `npm run build && npm run preview`

## 📝 Pull Request Process

1. **Update your branch** with latest changes from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git merge develop
   ```

2. **Push your changes**:
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request**:
   - Use a clear PR title
   - Describe what your PR does
   - Reference any related issues
   - Add screenshots for UI changes
   - Request reviewers

4. **Address Review Comments**:
   - Make requested changes
   - Push updates to your branch
   - Re-request review when ready

5. **Merge**:
   - PRs require at least one approval
   - Use "Squash and Merge" for feature branches
   - Delete branch after merging

## 🐛 Reporting Bugs

Found a bug? Please create an issue with:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/device information

## 💡 Feature Requests

Have an idea? Create an issue with:

- Clear description of the feature
- Use case / problem it solves
- Proposed implementation (if you have ideas)

## ⚖️ Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## 📞 Getting Help

- Create an issue for bugs or questions
- Reach out to maintainers for guidance
- Check existing issues and PRs first

## 🎯 Priority Features

Looking for something to work on? Check these high-priority features:

### Emergency Mode
- [ ] CPR Coach timer and audio guidance
- [ ] Emergency Action Cards content
- [ ] AED location integration
- [ ] Emergency contacts system
- [ ] Voice guidance implementation

### Health Check Mode
- [ ] Wound assessment tool
- [ ] Burn severity checker
- [ ] Doctor checklist logic
- [ ] Doctor prep form

### Infrastructure
- [ ] Mobile responsiveness improvements
- [ ] Accessibility enhancements
- [ ] Performance optimization
- [ ] Testing setup

---

Thank you for contributing to Vitalis! Together we're building something that can help save lives. 🏥❤️
