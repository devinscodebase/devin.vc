<script lang="ts">
  import Card from '../Card.svelte';
  import Heading from '../Heading.svelte';
  import Text from '../Text.svelte';
  import Tag from '../Tag.svelte';
  import Button from '../Button.svelte';
  import Stack from '../Stack.svelte';
</script>

<Card variant="elevated" padding="lg">
  {#snippet header()}
    <Stack direction="horizontal" gap="3" align="center" justify="between">
      <Tag index="01" tone="accent" size="sm">Header slot</Tag>
      <Text size="xs" tone="subtle" family="mono">2026.05.27</Text>
    </Stack>
  {/snippet}
  {#snippet footer()}
    <Stack direction="horizontal" gap="4" align="center" justify="between" wrap>
      <Stack direction="horizontal" gap="2" align="center">
        <Tag tone="success" size="sm">Published</Tag>
        <Text size="xs" tone="subtle">2 minute read</Text>
      </Stack>
      <Button variant="link" size="sm" arrow>Continue reading</Button>
    </Stack>
  {/snippet}
  <Stack gap="3">
    <Heading level={3} size="xl">Composed example</Heading>
    <Text tone="muted" measure>
      Header, body, and footer compose via Svelte snippets. The card handles its own internal rhythm — consumers just supply content. The footer uses a short accent hairline at the top-left to signal section break without dividing the card heavily.
    </Text>
  </Stack>
</Card>
