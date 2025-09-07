import { Box, Typography, Link, Stack } from '@mui/material'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        py: 3,
        borderTop: '1px solid #182032',
        color: 'text.secondary'
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Typography variant="body2">
          Lab L-12: Event Logger
        </Typography>
        <Typography variant="body2">
          Built with @mui/material and @bsv/sdk
        </Typography>
        <Link
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          color="inherit"
          variant="body2"
        >
          Docs
        </Link>
      </Stack>
    </Box>
  )
}