inherit ITEM;
inherit F_FOOD;

void create()
{
     set_name("冰雪翡翠糕", ({ "gao" }));
     set_weight(1000);
     if( clonep() )
            set_default_object(__FILE__);
     else {
          set("long", "这是一块糕点，引人食欲大增。\n");
          set("unit", "块");
          set("value", 50);
          set("food_remaining", 6);
          set("food_supply", 100);
     }
}
