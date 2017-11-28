#include <ansi.h>

inherit NPC;
//inherit F_UNIQUE;

void create()
{
        set_name(HIY "黄骠马" NOR, ({ "huangbiaoma"}));
        set("race", "野兽");
        set("gender", "雄性");
        set("age", random(3));
        set("long", "这是一匹黄骠骏马，全身金黄，没有一丝杂毛。\n");
        set("ridable", 1);
        set("unit", "匹");
        set("int", 30);
        set("qi", 300);
        set("max_qi", 300);
        set("jing", 100);
        set("max_jing", 100);
        set("shen_type", 0);
        set("combat_exp",50000);
        set("attitude", "peaceful");

        set("limbs", ({ "头部", "腹部", "尾巴","后腿","前腿" }) );
        set("verbs", ({ "bite", "hoof" }) );
        set_temp("apply/attack", 50);
        set_temp("apply/armor", 15);
        set_temp("apply/damage", 25);

        setup();
}

