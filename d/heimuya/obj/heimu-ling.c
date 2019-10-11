// heimu-ling.c 黑木令

inherit ITEM;
#include <ansi.h>;
void create()
{
        set_name(BLK"黑木令"NOR, ({"heimu ling", "heimu", "ling"}));
        set_weight(500);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("unit", "面");
                set("long","这是一块是块枯焦的黑色木头，长约半尺，上
面雕刻有花纹文字，看来十分诡异。\n");
//		set("no_drop", "这样东西不能离开你。\n");
                set("material", "wood");
        }
}

