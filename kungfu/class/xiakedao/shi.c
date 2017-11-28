#include <ansi.h>
inherit NPC;

void create()
{
        set_name("石破天", ({"shi potian", "shi", "potian"}));
        set("nickname", HIW "长乐帮主" NOR);
        set("gender", "男性");
        set("age", 20);
        set("long", "他大约二十多岁，穿着一身破烂的衣服，却"
                    "也挡不住他一身的英气。\n");
        set("max_qi", 8000);
        set("max_jing", 6000);
        set("neili", 10000);
        set("max_neili", 10000);
        set("jiali", 200);
        set("combat_exp", 5000000);
        set("shen_type", 1);
        set("score", 20000);

        set_skill("force", 340);
        set_skill("taixuan-gong", 340);
        set_skill("dodge", 340);
        set_skill("blade", 340);
        set_skill("jinwu-daofa", 320);
        set_skill("unarmed", 340);
        set_skill("sword", 340);
        set_skill("shangqing-jian", 320);
        set_skill("xueshan-jian", 320);
        set_skill("parry", 300);
        set_skill("strike", 280);
        set_skill("bizhen-qingzhang", 180);
        set_skill("martial-cognize", 260);

        map_skill("force", "taixuan-gong");
        map_skill("dodge", "taixuan-gong");
        map_skill("unarmed", "taixuan-gong");
        map_skill("parry", "taixuan-gong");
        map_skill("strike", "bizhen-qingzhang");
        map_skill("blade", "jinwu-daofa");
        map_skill("sword", "taixuan-gong");

        prepare_skill("unarmed", "taixuan-gong");

        set_temp("apply/attack", 100);
        set_temp("apply/defense", 100);
        set_temp("apply/dodge", 100);
        set_temp("apply/damage", 120);
        set_temp("apply/unarmed_damage", 100);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.jing" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }) );

        set("inquiry", ([
                "石中玉" : "他是我的兄弟，他现在在摩天崖。",
                "阿绣"   : "呀！你见过她吗？她还好吧。",
                "谢烟客" : "老伯伯可是个好人啊。",
                "狗杂种" : "我就是狗杂种，找我有什么事吗。",
                "侠客岛" : "那…那上面…这个…你还是别问为好。",
                "史婆婆" : "他是我师父呀，也不知道她现在怎么样了。",
                "太玄功" : "我…我不知道，这个你别问我。",
                "太玄神功" : "我…我不知道，这个你别问我。",
        ]));

        create_family("金乌派", 2, "掌门弟子");
        setup();

        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/gangjian")->wield();

        if (random(4) == 1)
                set_temp("handing", carry_object("/d/xiakedao/obj/jiu"));
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player())
           && ! is_fighting()
           && random(3) == 1)
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        if (! objectp(ob)
           || environment(ob) != environment())
                return;

        say(HIW "\n只见石破天盘膝坐在树上，白雾从体内冉冉升起，笼罩四方。\n" NOR);

        return;
}

void attempt_apprentice(object ob)
{
        command("ah");
        command("say 那不成，那不成。我自己都还没学好呢。");
}

void unconcious()
{
        die();
}

