# Versioning Strategy for Julienites Alumni Network

## Current Version
- **Version**: 0.1.0
- **Status**: Initial development release
- **Release Date**: Initial implementation

## Version Format
We follow [Semantic Versioning 2.0.0](https://semver.org/):

**Format**: `MAJOR.MINOR.PATCH`

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (0.X.0): New functionality in a backward compatible manner
- **PATCH** version (0.0.X): Backward compatible bug fixes

## Version Display

The version is displayed in several places throughout the application:

1. **Header Badge**: Shows "Alumni Network v0.1.0" in the top navigation
2. **Copyright Footer**: Shows "© 2024 Julienites Alumni Network v0.1.0"
3. **All page headers**: Consistent version display across all pages

## How to Update the Version

### Using the Update Script (Recommended)

We provide a convenient script to update the version:

```bash
# Make sure you're in the frontend directory
cd julienites/frontend

# Update to a new version
node scripts/update-version.js 0.2.0
```

The script will:
1. Update `package.json` version
2. Update `src/config/version.ts`
3. Provide instructions for committing and tagging

### Manual Update

If you prefer to update manually:

1. Update `package.json`:
   ```json
   {
     "name": "frontend",
     "version": "0.2.0",  # Update this line
     // ... rest of package.json
   }
   ```

2. Update `src/config/version.ts`:
   ```typescript
   export const APP_VERSION = '0.2.0';  # Update this line
   // ... rest of version.ts
   ```

## Version History

### v0.1.0 (Initial Release)
- Initial implementation of Julienites Alumni Network
- User authentication (login/register)
- Member profiles and directory
- Twitter/X-like interface design
- Dark/light theme support
- Responsive design for mobile and desktop

## Release Checklist

When creating a new release:

1. [ ] Update version using the script
2. [ ] Run tests: `npm test`
3. [ ] Build the application: `npm run build`
4. [ ] Verify no errors in the build
5. [ ] Commit changes: `git commit -am "Bump version to vX.X.X"`
6. [ ] Create tag: `git tag -a vX.X.X -m "Version X.X.X"`
7. [ ] Push with tags: `git push origin main --tags`
8. [ ] Update this documentation if needed

## Best Practices

1. **Increment PATCH** for bug fixes and minor improvements
2. **Increment MINOR** for new features that don't break existing functionality
3. **Increment MAJOR** for breaking changes (API changes, major redesigns)
4. **Always update version** before deploying to production
5. **Keep version history** in this document

## Environment-Specific Versions

In the future, we may implement:
- Development vs Production version display
- Version API endpoint for health checks
- Automated version bumping in CI/CD pipeline
- Changelog generation

## Related Files

- `package.json` - NPM package version
- `src/config/version.ts` - Application version configuration
- `scripts/update-version.js` - Version update script
- `docs/versioning.md` - This documentation