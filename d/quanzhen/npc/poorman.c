#include <ansi.h>
inherit NPC;

void create()
{
        set_name("穷汉", ({ "qiong han", "qiong", "han" }));
        set("gender", "男性" );
        set("age", 33);
        set("long", "一个骨瘦如柴，满脸菜色的穷汉。\n");
        set("attitude", "friendly");
        set("combat_exp", 250);
        set("shen_type", 1);
        set("str", 20);
        set("dex", 18);
        set("con", 17);
        set("int", 13);
        setup();

        set("chat_chance", 15);
        set("chat_msg", ({
                CYN "穷汉懒洋洋地打了个哈欠。\n" NOR,
                CYN "穷汉捉住身上的虱子，骂道：老子身上没几两肉，全叫你们给咬了。 \n" NOR,
                (: random_move :)
        }));
        carry_object(__DIR__"obj/cloth")->wear();
}
