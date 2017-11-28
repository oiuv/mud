// goldbow.c

#include <ansi.h>

inherit __DIR__"bow";

void create()
{
        set_name(HIR "赤鸳弩" NOR, ({ "chiyuan nu", "chiyuan", "nu", "bow" }));
        set_weight(5000);
        if (clonep())
                set_default_object(__FILE__);
        else
        {
                set("unit", "张");
                set("long", HIR "这是一张铅铁所铸，舞凤雕纹，制作非常精细的弩。\n" NOR);
                set("no_sell", "我的天…郡王府的东西你也敢拿来卖？");
		set("value", 80000);
                set("power", 200000);   // 攻击威力
                set("accuracy", 200);   // 准确度200%
        }
        setup();
}
