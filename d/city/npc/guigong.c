// guigong.c
inherit NPC;

void create()
{
        set_name("龟公", ({ "gui gong", "gui", "gong" }));
        set("gender", "男性");
        set("age", 25);

        set("long", "一个满脸狠肉的汉子，在丽春院日子久了，养的白白肥肥。\n");
        set("combat_exp", 30000);
        set("shen_type", 2);
        set_skill("unarmed", 70);
        set_skill("dodge", 70);
        set("chat_msg", ({
             "小娘皮，来了这里就乖乖地侍侯大爷们吧。",
             "想跑？跑到天涯海角都给你追回来！",
             "哼！你们这些小贱人，活该！",
        }) );
        setup();
        carry_object(__DIR__"obj/cloth")->wear();
}
