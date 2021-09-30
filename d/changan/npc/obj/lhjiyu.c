//lhjiyu.c

#include <ansi.h>

inherit ITEM;
inherit F_FOOD;

void create()
{
        string name =HIY "罗汉鲫鱼" NOR;
      set_name(name, ({"luohan jiyu", "jiyu", "yu"}));
      set_weight(300);
      if (clonep())
            set_default_object(__FILE__);
      else
    {
            set("long", "一盘令人垂涎的"+name+"。\n");
            set("unit", "盘");
            set("value", 1000);
            set("food_remaining", 10);
            set("food_supply", 30);
    }
}
