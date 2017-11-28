#include <ansi.h>
#include "wudang.h"

#define WUDANG    "/clone/lonely/book/wudang"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;
inherit F_COAGENT;

mixed ask_book1();
mixed ask_book2();
mixed ask_skill();

void create()
{
        set_name("宋远桥", ({ "song yuanqiao", "song", "yuanqiao" }));
        set("nickname", HIC "武当首侠" NOR);
        set("long", "他就是张三丰的大弟子、武当七侠之首的宋远桥。\n"
                    "身穿一件干干净净的灰色道袍。他身材瘦长，满\n"
                    "脸红光。恬淡冲和，沉默寡言。\n");
        set("gender", "男性");
        set("age", 61);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 31);
        set("int", 27);
        set("con", 32);
        set("dex", 30);
        
        set("max_qi", 6000);
        set("max_jing", 5000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 200);
        set("combat_exp", 2000000);
        set("score", 100000);

        set_skill("force", 260);
        set_skill("wudang-xinfa", 260);
        set_skill("taiji-shengong", 240);
        set_skill("dodge", 240);
        set_skill("tiyunzong", 240);
        set_skill("unarmed", 240);
        set_skill("taiji-quan", 220);
        set_skill("strike", 240);
        set_skill("wudang-zhang", 240);
        set_skill("zhenshan-zhang", 240);
        set_skill("hand", 240);
        set_skill("paiyun-shou", 240);
        set_skill("parry", 240);
        set_skill("sword", 260);
        set_skill("wudang-jian", 260);
        set_skill("shenmen-jian", 260);
        set_skill("taiji-jian", 240);
        set_skill("taoism", 240);
        set_skill("literate", 220);
        set_skill("martial-cognize", 240);
        set_skill("medical", 200);
        set_skill("wudang-yaoli", 200);

        map_skill("force", "taiji-shengong");
        map_skill("dodge", "tiyunzong");
        map_skill("unarmed", "taiji-quan");
        map_skill("parry", "taiji-quan");
        map_skill("sword", "taiji-jian");
        map_skill("strike", "zhenshan-zhang");
        map_skill("hand", "paiyun-shou");
        map_skill("medical", "wudang-yaoli");

        prepare_skill("unarmed", "taiji-quan");
        prepare_skill("strike", "wudang-zhang");

        set("no_teach", ([
                "taiji-shengong" : "要想学习太极神功请向张真人请教。",
                "taiji-jian"     : "太极剑必须张真人亲传。",
                "taiji-quan"     : "太极拳必须张真人亲传。",
        ]));

        create_family("武当派", 2, "弟子");

        set("inquiry", ([
                "武当药理"   : (: ask_book1 :),
                "太极十三式" : (: ask_book2 :),
                "神门刺"     : (: ask_skill :),
        ]));

        set("book_count", 1);

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.zhenwu" :),
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

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);

        set("coagents", ({
                ([ "startroom" : "/d/wudang/houyuan",
                   "id"        : "yu lianzhou" ]),
        }));

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 25000)
        {
                command("say 我武当乃是堂堂名门正派，对弟子要求极严。");
                command("say 在德行方面，" + RANK_D->query_respect(ob) +
                        "是否还做得不够？");
                return;
        }

	if ((int)ob->query("combat_exp") < 300000)
	{
		command("say 你现在经验尚浅，不能领会高深的武功，先锻炼要紧。");
		return;
	}

        if ((int)ob->query_skill("wudang-xinfa", 1) < 100)
        {
                command("say 我武当派最注重内功心法" + RANK_D->query_respect(ob)+
                        "是否应该在武当心法上多下点功夫啊?");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 100)
        {
                command("say 习武是为了强身健体，一味的练武是不可取的。");
                command("say 我看你还需要在修身养性方面多锻炼锻炼，以提高"
                        "你的道德心法。");
                return;
        }

        command("say 好吧，我就收下你了。");
        command("say 希望你能全心修炼道家心法，领悟道家真髓！");
        command("recruit " + ob->query("id"));
        if ((string)ob->query("class") != "taoist")
                ob->set("class", "taoist");
}

mixed ask_skill()
{
        object me;

        me = this_player();
        if (me->query("can_perform/shenmen-jian/ci"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("shenmen-jian", 1) < 1)
                return "你连神门十三剑都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 30000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("force") < 160)
                return "你的内功的修为不够，练高了再来吧。";

        if (me->query_skill("shenmen-jian", 1) < 120)
                return "你的神门十三剑还不到家，要多练练！";

        message_vision(HIY "$n" HIY "点了点头，在$N" HIY "耳边轻声嘀"
                       "咕了几句，又拔出腰间长\n剑，挥舞出几个剑花，"
                       "然后猛地斜斜刺出。招式简朴，毫无\n半点华丽可"
                       "言。\n" NOR, me, this_object());
        command("nod");
        command("say 你可明白了？");
        tell_object(me, HIC "你学会了「神门刺」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("shenmen-jian"))
                me->improve_skill("shenmen-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shenmen-jian/ci", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_book1()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "武当派")
                return "你又不是我武当派的传人，这话是什么意思？";

        if (me->query("shen") < 10000)
                return "你侠义正事做得不够，这本书我还不能给你。";

        if ((int)me->query_skill("wudang-yaoli", 1) < 50)
                return "你对武当药理的了解太浅，还是过段时间再说吧。";

        ob = find_object(WUDANG);
        if (! ob) ob = load_object(WUDANG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "那本药理不就是你拿着在看吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…武当药理现在不在我手里。";

                if (owner->query("family/family_name") == "武当派")
                        return "那书现在暂时是你同门" + owner->query("name") +
                               "在看，你要用就去找他吧。";
                else
                        return "武当药理经现在落在了" + owner->query("name") +
                               "手中，你去找他索回吧。";
        }
        ob->move(this_object());
        command("say 这本武当药理你就拿去看吧，可要认真研读。");
        command("give wudang yaoli to " + me->query("id"));
        return 1;
}

mixed ask_book2()
{
        object ob;
        
        if (this_player()->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(this_player()) + 
                       "与本派素无来往，不知此话从何谈起？";

        if (query("book_count") < 1)
                return "你来晚了，本派的内功心法不在此处。";

        add("book_count", -1);
        ob = new("/clone/book/force_book");
        message_vision("$N拿出太极十三式(shu)给$n。\n",
                       this_object(), this_player());
        ob->move(this_player(), 1);
        return "好吧，这本「太极十三式」你拿回去好好钻研。";
}

