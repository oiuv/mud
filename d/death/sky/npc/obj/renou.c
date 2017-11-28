#include <ansi.h>
inherit ITEM;

void setup()
{}
void create()
{
      set_name(YEL "人偶" NOR, ({"renou"}));
      set("unit", "块");
      set("long", "一块未完工的木偶，但已经可以辨认出是个女子的雕像。\n");
      set("value", 0);
      set_weight(200);
        
      setup();
}
