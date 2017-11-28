#include <ansi.h>
inherit NPC;

void create()
{
        set_name("赵敏", ({ "zhao min", "min", "zhao" }));
        set("title", HIY "大元绍敏郡主" NOR);
        set("long", @LONG
她脸泛红霞，容色丽都。十分美丽之中，更带
着三分英气，三分豪态，同时雍容华贵，自有
一副端严之致，令人肃然起敬，不敢逼视。
LONG);
        set("gender", "女性");
        set("age", 19);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 30);
        set("str", 15);
        set("int", 25);
        set("con", 25);
        set("dex", 30);

        set("max_qi", 500);
        set("max_jing", 200);
        set("max_neili", 500);
        set("neili", 500);
        set("jiali", 50);
        set("combat_exp", 60000);
        set("score", 20000);

        set_skill("force", 80);
        set_skill("dodge", 80);
        set_skill("unarmed", 80);
        set_skill("sword", 80);
        set_skill("liangyi-jian", 80);
        set_skill("huifeng-jian", 80);
        set_skill("taiji-shengong", 90);
        set_skill("changquan", 80);
        set_skill("lingxu-bu", 80);
        map_skill("dodge", "lingxu-bu");
        map_skill("parry", "liangyi-jian");
        map_skill("sword", "liangyi-jian");
        map_skill("unarmed", "changquan");

        set("inquiry", ([
                "张无忌" : "张公子远在昆仑，不知他近来可好？秋冷春寒，可有寒衣？",
                "倚天剑" : "倚天为天下神兵，怎么，你想要？",
        ]));

        setup();
        carry_object("/d/city/npc/cloth/moon-dress")->wear();
}

void fight_ob(object ob)
{
        object me = this_object();
        object where = environment(me);
        object guard1, guard2, guard3;

        guard1 = present("a da", where);
        guard2 = present("zhao yishang", where);
        guard3 = present("qian erbai", where);

        if (is_fighting(ob))
                return;

        if (guard1 && ! guard1->is_fighting())
        {
                message_vision(CYN "$N" CYN "冷哼道：找死！\n" NOR,
                               guard1);
                guard1->kill_ob(ob);
        }

        if (guard2 && ! guard2->is_fighting())
        {
                message_vision(CYN "$N" CYN "大怒，喝道：哪里来的"
                               "贱种，居然跑到这里来撒野！\n" NOR,
                               guard2);
                guard2->kill_ob(ob);
        }

        if (guard3 && ! guard3->is_fighting())
        {
                message_vision(CYN "$N" CYN "喝道：贼子不得无礼！"
                               "\n" NOR, guard3);
                guard3->kill_ob(ob);
        }
        ::fight_ob(ob);
}

int accept_fight(object ob)
{
        command("say 没兴趣。");
        return 0;
}

int accept_kill(object ob)
{
        return 1;
}

int accept_hit(object ob)
{
        return 1;
}

int accept_touxi(object ob)
{
        return 1;
}

void unconcious()
{
        die();
}

void die()
{
        message_vision(HIW "\n赵敏微微一笑，摇了摇头。突然间听得两声厉"
                       "啸传来，从赵敏\n身后闪过两道人影。你微觉眼花，"
                       "慌忙中正待出招相应，却只\n见人影疾晃，回过神之"
                       "后，哪里还有赵敏的踪影。\n\n" NOR, this_object());
        destruct(this_object());
}
