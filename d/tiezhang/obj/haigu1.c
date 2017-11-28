#include <ansi.h>

inherit ITEM;

void create()
{
       set_name("骸骨", ({"haigu"}) );
       set_weight(10000);
       set_max_encumbrance(6000000);
       if( clonep() )
               set_default_object(__FILE__);
       else{
       set("unit", "具");
       set("long", "这是一具男子的骸骨。\n");
       set("value", 0);
       set("material","wood");
       set("no_get",1);
       set("init",0);
       }
       setup();
}

void init()
{
       object ob;
       object me=this_object();
       if( query("init") == 0 ) {
               ob=new("/u/qingyun/mingjiao/obj/parry_book");
               ob->move(me);
               add("init",1);
       }
}
