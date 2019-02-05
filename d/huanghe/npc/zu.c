// zu.c

#include <ansi.h>

inherit KNOWER;

void create()
{
        set_name("祖千秋", ({ "zu qianqiu", "zu", "qianqiu" }) );
        set("title", "黄河老祖");
        set("nickname", HIC "消息灵通" NOR);
        set("gender", "男性" );
        set("age", 52);
        set("long", "一个衣衫褴偻的落魄书生。焦黄脸皮，一个酒糟鼻，疏疏落落的
几根胡子，两眼无神。衣衫上一片油光，右手拿了一把破折扇。\n");
        set("combat_exp", 100000);
        set("attitude", "friendly");

        set("max_jing",500);
        set("max_qi",500);
        set("per", 17);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 30);

        set_skill("literate", 100);
        set_skill("dodge", 100);
        set_skill("unarmed", 100);
        setup();
        add_money("silver", 10);
        carry_object("d/city/obj/cloth")->wear();
}
