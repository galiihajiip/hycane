# DATA MODEL

## User

```js
{
  id,
  name,
  email,
  city,
  experienceLevel,
  joinedAt,
  deviceCount,
  healthyPlants
}
```

## Device state

```js
{
  deviceId,
  name,
  ph,
  tds,
  ec,
  temperature,
  waterLevel,
  pumpOn,
  lightOn,
  sensorHealth,
  lastUpdated
}
```

## Product

```js
{
  id,
  name,
  category,
  description,
  beginnerExplanation,
  benchmarkCost,
  demoRetailPrice,
  marginPct,
  unit,
  stock,
  rating,
  images,
  sourceType,
  sourceUrl,
  sourceCapturedAt,
  tags,
  bundleComponents
}
```

## Crop

```js
{
  id,
  name,
  type,
  image,
  daysAfterPlanting,
  growthStage,
  healthScore,
  harvestEstimate,
  issue,
  recommendation
}
```

## Education

```js
{
  slug,
  title,
  category,
  level,
  summary,
  whyItMatters,
  body,
  analogy,
  dos,
  donts,
  quiz
}
```

## Order

```js
{
  id,
  date,
  items,
  subtotal,
  shipping,
  total,
  status
}
```
