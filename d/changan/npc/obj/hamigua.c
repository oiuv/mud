//hamigua.c

inherit ITEM;
inherit F_FOOD;

void create()
{
        set_name("哈密瓜", ({"hami gua", "hamigua", "gua"}));
        set_weight(80);
      if (clonep())
          set_default_object(__FILE__);
      else
    {
          set("long", "一颗散发清香的哈密瓜。�n");
          set("unit", "颗");
          set("value", 120);
          set("food_remaining", 4);
          set("food_supply", 30);
    }
}
