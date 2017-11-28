//yahuan.c

inherit NPC;

void create()
{
        set_name("丫环", ({"yahuan"}));
        set("long","一个小丫环，正在打扫房间．\n");
        set("gender", "女性");
        set("age", 16);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("combat_exp", 500);

        setup();
        carry_object(__DIR__"obj/skirt")->wear();
}
