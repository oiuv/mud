// pang.c

#include <ansi.h>

inherit NPC;
inherit F_UNIQUE;
//inherit F_QUESTER;
mixed ask_back();
void create()
{
        set_name("胖头陀", ({ "pang toutuo", "pang" ,"toutuo"}));
        set("title", HIY"神龙教"NOR"左护法");
        set("nickname",HIR "辽东胖尊者" NOR);
        set("long", "这头陀身材奇高，而且瘦得出奇；脸上皮包骨头、双\n"
                    "目深陷，当真便如僵尸一般。\n" );
        set("gender", "男性");
        set("age", 44);

        set("str", 32);
        set("int", 28);
        set("con", 31);
        set("dex", 25);

        set("max_qi", 4700);
        set("qi", 4700);
        set("max_jing", 2400);
        set("jing", 2400);
        set("neili", 4800); 
        set("max_neili", 4800);
        set("jiali", 60);

        set("combat_exp", 750000);
        set("no_get", "别人在做任务，你想把人搬到哪里去？\n");
        set("shen_type", -1);
        set("attitude", "peaceful");

        set_skill("force", 160);
        set_skill("hand", 160);
        set_skill("strike", 160);
        set_skill("staff", 160);
        set_skill("parry", 160);
        set_skill("dodge", 160);
        set_skill("yixingbu", 160);
        set_skill("shenlong-bashi", 160);
        set_skill("huagu-mianzhang", 160);
        set_skill("shenlong-xinfa", 160);
        set_skill("shedao-qigong", 160);

        map_skill("staff", "shedao-qigong");
        map_skill("force", "shenlong-xinfa");
        map_skill("hand", "shenlong-bashi");
        map_skill("strike", "huagu-mianzhang");
        map_skill("parry", "shedao-qigong");
        map_skill("dodge", "yixingbu");

        prepare_skill("hand", "shenlong-bashi");
        prepare_skill("strike", "huagu-mianzhang");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
                (: perform_action, "staff.chang" :),
                (: perform_action, "staff.chang2" :),
                (: perform_action, "staff.chang3" :),
                (: perform_action, "strike.hua" :),
                (: perform_action, "hand.xian" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 120);
        set_temp("apply/armor", 200);

        create_family("神龙教", 0, "闲散教众");

        set("inquiry", ([
                "神龙教" : "一般人是入不了我神龙教的(join shenlongjiao).\n",
                "入教"   : "一般人是入不了我神龙教的(join shenlongjiao).\n",
                "洪安通" : "教主脾气不好，要讨他欢心才好。\n",
                "教主"   : "教主脾气不好，要讨他欢心才好。\n",
                "口号"   : "万年不老！永享仙福！寿与天齐！文武仁圣！",
                "神龙飞天" : (: ask_back :),
        ]));
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        //command("say 慢来！慢来！你想拜师去找教主吧。");
        command("say 我神龙教不对外收徒。");
}

void init()
{
        add_action("do_join", "join");
}

int do_join(string arg)
{
	if (arg != "shenlongjiao")
		return notify_fail("你要加入什么组织？\n"); 

        message_vision("$N摆了摆手，对$n道：“我可不敢收你入教，你还是去"
                       "关外神龙岛上去找我们教主好了”\n",
                       this_object(), this_player());
        return 1;
}

void unconcious()
{
        die();
}

mixed ask_back()
{
        object me;

        me = this_player();
        if (me->query("family/family_name") != "神龙教")
        {
                message_vision("$N冷冷的看了$n一眼，不知道在想些什么。\n",
                               this_object(), me);
                return -1;
        }

        message_sort(HIY "\n$N" HIY "看了看$n"
                     HIY "，然后说点：既然如此，我就送你回岛。\n\n" NOR, this_object(), me);

        me->move("/d/shenlong/kongdi");
        tell_object(me, CYN + name() + "说道：就送你到这里，别乱转被毒死了。\n"
                        HIC + name() + "说完便急急忙忙离开了。\n" NOR);
        return -1;
}
