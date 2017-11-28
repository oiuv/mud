// goldbow.c

#include <ansi.h>

inherit __DIR__"bow";

void create()
{
        set_name(HIY "点金盘龙弓" NOR, ({ "panlong gong", "gong", "panlong", "bow" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "张");
                set("long", HIY "这是一张金铜所铸，盘龙雕纹，制作非常精细的长弓。\n" NOR);
                set("no_sell", "我的天…郡王府的东西你也敢拿来卖？");
		set("value", 80000);
                set("power", 250000);   // 攻击威力
                set("accuracy", 120);   // 准确度120%
        }
        setup();
}
