#include <weapon.h>
#include <ansi.h>
inherit SWORD;

void create()
{
        set_name(HIR "赤剑" NOR, ({ "chi jian" , "jian" , "sword", "chi", "chijian" }) );
        set_weight(12000);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "柄");
                set("long", HIR "一柄四尺来长的长剑，整个剑身呈红色。\n" NOR);
                set("value", 200000);
                set("rigidity", 8000);   
                set("material", "steel");
                set("wield_msg", HIR "$N" HIR "从背后抽出赤剑，顿时腾起一股凛冽的杀气。\n" NOR);
                set("unwield_msg", HIR "$N" HIR "叹了口气，将赤剑插回背后。\n" NOR);
        }
        init_sword(250);
        setup();
}

