#include <ansi.h>
#include "wudang.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("莫声谷", ({ "mo shenggu", "mo", "shenggu" }));
        set("nickname", HIC "武当七侠" NOR);
        set("long", "他就是张三丰的七弟子莫声谷。他看起\n"
                    "来二十多岁，显得稚气未脱。但却也是\n"
                    "江湖中行侠仗义，声明远播的侠客。\n");
        set("gender", "男性");
        set("age", 40);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 24);
        set("int", 27);
        set("con", 25);
        set("dex", 22);
        
        set("max_qi", 3600);
        set("max_jing", 1800);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 60);
        set("combat_exp", 850000);
        set("score", 80000);

        set_skill("force", 180);
        set_skill("wudang-xinfa", 180);
        set_skill("taiji-shengong", 160);
        set_skill("dodge", 180);
        set_skill("tiyunzong", 180);
        set_skill("unarmed", 160);
        set_skill("taiji-quan", 160);
        set_skill("strike", 160);
        set_skill("zhenshan-zhang", 160);
        set_skill("hand", 160);
        set_skill("paiyun-shou", 160);
        set_skill("wudang-zhang", 160);
        set_skill("parry", 180);
        set_skill("sword", 180);
        set_skill("wudang-jian", 180);
        set_skill("taiji-jian", 160);
        set_skill("taoism", 160);
        set_skill("literate", 150);
        set_skill("martial-cognize", 160);

        map_skill("force", "taiji-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-jian");
        map_skill("sword", "taiji-jian");
        map_skill("strike", "zhenshan-zhang");
        map_skill("hand", "paiyun-shou");

        prepare_skill("unarmed", "taiji-quan");

        set("no_teach", ([
                "taiji-shengong" : "要想学习太极神功请向张真人请教。",
                "taiji-jian"     : "太极剑必须张真人亲传。",
                "taiji-quan"     : "太极拳必须张真人亲传。",
        ]));

        create_family("武当派", 2, "弟子");
	set("class", "taoist");

        set("inquiry", ([
                "隔山打牛" : (: ask_skill1 :),
                "太极初升" : (: ask_skill2 :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.chan" :),
		(: perform_action, "sword.jia" :),
		(: perform_action, "sword.sui" :),
		(: perform_action, "sword.zhuan" :),
                (: perform_action, "unarmed.zhen" :),
                (: perform_action, "unarmed.zhan" :),
                (: perform_action, "unarmed.ji" :),
                (: perform_action, "unarmed.yin" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "shield" :),
	}) );

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/whiterobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 5000 )
        {
                command("say 我武当乃是堂堂名门正派，对弟子要求极严。");
                command("say 在德行方面，" + RANK_D->query_respect(ob) +
                        "是否还做得不够？");
                return;
        }

        if ((int)ob->query_skill("wudang-xinfa", 1) < 50)
        {
                command("say 我武当派最注重内功心法" + RANK_D->query_respect(ob)+
                        "是否应该在武当心法上多下点功夫啊?");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 50)
        {
                command("say 习武是为了强身健体，一味的练武是不可取的做！");
                command("say 我看你还需要在修身养性方面多锻炼锻炼，以提高你"
                        "的道德心法。");
                return;
        }

        command("say 好吧，我就收下你了。");
        command("say 希望你能好好用功，发扬我武当精神！");
        command("recruit " + ob->query("id"));
        if ((string)ob->query("class") != "taoist")
                ob->set("class", "taoist");
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/zhenshan-zhang/da"))
                return "能教的我都教了，你自己练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("zhenshan-zhang", 1) < 1)
                return "你连震山掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 50)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 6000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("zhenshan-zhang", 1) < 40)
                return "你的震山掌修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 200)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_vision(HIY "$n" HIY "点了点头，将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听"
                       "后会心\n的一笑，看来大有所悟。\n" NOR, me,
                       this_object());
        command("say 这招再简单不过，自己下去练吧。");
        tell_object(me, HIC "你学会了「隔山打牛」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("zhenshan-zhang"))
                me->improve_skill("zhenshan-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhenshan-zhang/da", 1);
        me->add("gongxian", -50);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/wudang-jian/sheng"))
                return "你自己去练习吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("wudang-jian", 1) < 1)
                return "你连武当剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 80)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 2000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("force") < 80)
                return "你的内功的修为不够，练高了再来吧。";

        if (me->query_skill("wudang-jian", 1) < 60)
                return "你的武当剑法修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 300)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_vision(HIY "$n" HIY "微微一笑，从怀中轻轻取出了一本"
                       "剑谱，指着其中一段对$N" HIY "细\n说良久，$N"
                       HIY "一边听一边点头。\n" NOR, me, this_object());
        command("say 你懂了吗？");
        tell_object(me, HIC "你学会了「太极初升」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("wudang-jian"))
                me->improve_skill("wudang-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wudang-jian/sheng", 1);
        me->add("gongxian", -80);

        return 1;
}