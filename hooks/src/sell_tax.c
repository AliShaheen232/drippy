#include "common.h"

int64_t hook(uint32_t r) {
  // Logic for liquidity provisioning
  return accept("Sell tax applied", 18);
}