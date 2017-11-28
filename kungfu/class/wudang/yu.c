#include <ansi.h>
#include "wudang.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_me();

void create()
{
        set_name("俞莲舟", ({ "yu lianzhou", "yu", "lianzhou" }));
        set("nickname", HIC "武当二侠" NOR);
        set("long", "他就是张三丰的二弟子俞莲舟。他今年五\n"
                    "十岁，身材魁梧，气度凝重。虽在武当七\n"
                    "侠中排名第二，功夫却是最精。\n");
        set("gender", "男性");
        set("age", 50);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 32);
        set("dex", 32);
        
        set("max_qi", 5800);
        set("max_jing", 4600);
        set("neili", 6500);
        set("max_neili", 6500);
        set("jiali", 200);
        set("combat_exp", 1800000);
        set("score", 100000);

        set_skill("force", 250);
        set_skill("wudang-xinfa", 250);
        set_skill("taiji-shengong", 240);
        set_skill("dodge", 240);
        set_skill("tiyunzong", 240);
        set_skill("unarmed", 240);
        set_skill("taiji-quan", 220);
        set_skill("claw", 250);
        set_skill("huzhua-shou", 250);
        set_skill("strike", 240);
        set_skill("wudang-zhang", 240);
        set_skill("zhenshan-zhang", 240);
        set_skill("hand", 240);
        set_skill("paiyun-shou", 240);
        set_skill("parry", 240);
        set_skill("sword", 250);
        set_skill("wudang-jian", 250);
        set_skill("taiji-jian", 240);
        set_skill("taoism", 230);
        set_skill("literate", 200);
	set_skill("medical", 180);
	set_skill("wudang-yaoli", 180);
        set_skill("martial-cognize", 240);

        map_skill("force", "taiji-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-quan");
        map_skill("sword", "taiji-jian");
        map_skill("strike", "zhenshan-zhang");
        map_skill("hand", "paiyun-shou");
        map_skill("claw", "huzhua-shou");
        map_skill("medical", "wudang-yaoli");

        prepare_skill("claw", "huzhua-shou");

        set("no_teach", ([
                "taiji-shengong" : "要想学习太极神功请向张真人请教。",
                "taiji-jian"     : "太极剑必须张真人亲传。",
                "taiji-quan"     : "太极拳必须张真人亲传。",
        ]));

        create_family("武当派", 2, "弟子");

        set("inquiry", ([
                "绝户神抓" : (: ask_me :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "claw.juehu" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "shield" :),
        }) );

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);

        setup();

        carry_object("/d/wudang/obj/whiterobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 20000 )
        {
                command("say 我武当乃是堂堂名门正派，对弟子要求极严。");
                command("say 在德行方面，" + RANK_D->query_respect(ob) +
                        "是否还做得不够？");
                return;
        }

	if ((int)ob->query("combat_exp") < 150000)
	{
		command("say 你现在经验尚浅，不能领会高深的武功，先锻炼要紧。");
		return;
	}

        if ((int)ob->query_skill("wudang-xinfa", 1) < 80)
        {
                command("say 我武当派最注重内功心法" + RANK_D->query_respect(ob)+
                        "是否应该在武当心法上多下点功夫啊?");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 80)
        {
                command("say 习武是为了强身健体，一味的练武是不可取的。");
                command("say 我看你还需要在修身养性方面多锻炼锻炼，以提高"
                        "你的道德心法。");
                return;
        }

        command("say 好吧，我就收下你了。");
        command("say 希望你能好好用功，发扬我武当精神！");
        command("recruit " + ob->query("id"));
        if( (string)ob->query("class") != "taoist")
                ob->set("class", "taoist");
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/huzhua-shou/juehu"))
                return "这一招你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("huzhua-shou", 1) < 1)
                return "你连虎爪绝户手都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 100000)
                return "这一招太过阴恨，如果被你用去我恐怕不放心！";

        if (me->query_skill("force") < 180)
                return "你的内功的修为不够，练高了再来吧。";

        if (me->query_skill("huzhua-shou", 1) < 120)
                return "你的虎爪绝户手还不到家，还是自己先下去多多练习吧。";

        message_vision(HIY "$n" HIY "叹了口气，在$N" HIY "耳边轻"
                       "声说了几句虎爪绝户手\n的精要，隔了良久，"
                       "又叹了一口气。\n" NOR, me, this_object());
        command("sigh");
        command("say 这便是绝户手的精要所在，你懂了多少？");
        command("say 绝户手太易使人重残，因而使用前一定要慎重考虑。");
        tell_object(me, HIC "你学会了「绝户神抓」。\n" NOR);
        if (me->can_improve_skill("claw"))
                me->improve_skill("claw", 1500000);
        if (me->can_improve_skill("huzhua-shou"))
                me->improve_skill("huzhua-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/huzhua-shou/juehu", 1);
        me->add("gongxian", -400);

        return 1;
}
