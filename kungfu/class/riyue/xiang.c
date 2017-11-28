#include <ansi.h>
#include "riyue.h"

#define CHILONG    "/clone/lonely/chilongsuo"
#define XINGLV     "/clone/item/xiaoao/xinglvtu"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_bian();
mixed ask_skill1();
mixed ask_skill2();

void create()
{
	object ob1, ob2;
        set_name("向问天", ({ "xiang wentian", "xiang", "wentian"}));
        set("nickname", HIR "天王老子" NOR );
        set("title", "日月神教光明右使");
        set("long", @LONG 
他就是日月神教的光明右使向问天，为人极为
豪爽。只见他白发苍苍，双目精光四射，内功
甚是精纯。
LONG);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 61);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 5800);
        set("max_jing", 4000);
        set("neili", 7600);
        set("max_neili", 7600);
        set("jiali", 200);
        set("combat_exp", 3000000);
        set("score", 50000);

        set_skill("force", 280);
        set_skill("xixing-xiaofa", 280);
        set_skill("tianhuan-shenjue", 280);
        set_skill("riyue-xinfa", 260);
        set_skill("dodge", 260);
        set_skill("feiyan-zoubi", 260);
        set_skill("juechen-shenfa", 260);
        set_skill("strike", 240);
        set_skill("qingmang-zhang", 240);
        set_skill("cuff", 260);
        set_skill("zhenyu-quan", 260);
        set_skill("claw", 260);
        set_skill("poyue-zhao", 260);
        set_skill("parry", 280);
        set_skill("whip", 280);
        set_skill("panlong-suo", 280);
        set_skill("blade", 260);
        set_skill("danding-dao", 260);
        set_skill("throwing", 240);
        set_skill("heixue-shenzhen", 240);
        set_skill("martial-cognize", 260);
        set_skill("literate", 240);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "xixing-xiaofa");
        map_skill("strike", "qingmang-zhang");
        map_skill("whip", "panlong-suo");
        map_skill("parry", "panlong-suo");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");
        map_skill("blade", "danding-dao");
        map_skill("throwing", "heixue-shenzhen");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        set("no_teach", ([
                "xixing-xiaofa" : "这东西是我自己创着玩的，拿出去未免贻笑大方。",
        ]));

        create_family("日月神教", 13, "光明右使");

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("inquiry", ([
                "赤龙金索" : (: ask_bian :),
                "跗骨缠魂" : (: ask_skill1 :),
                "绝命七杀" : (: ask_skill2 :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "whip.chan" :),
		(: perform_action, "whip.sha" :),
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
                (: perform_action, "throwing.luo" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
	}) );

        setup();

        if (clonep())
        {
                ob1 = find_object(XINGLV);
                if (! ob1) ob1 = load_object(XINGLV);
                if (! environment(ob1)) ob1->move(this_object());

                ob2 = find_object(CHILONG);
                if (! ob2) ob2 = load_object(CHILONG);
                if (! environment(ob2))
                {
                        ob2->move(this_object());
                        ob2->wield();
                } else
                {
                        ob2 = new("/clone/weapon/changbian");
                        ob2->move(this_object());
                        ob2->wield();
                }
        }
        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -50000)
        {
                command("killair");
                command("say 老子最讨厌伪君子，再不滚开我毙了你！");
                return;
        }

        if (ob->query("combat_exp") < 300000)
        {
                command("say 你现在江湖经验太浅，应该多走动走动。");
                return;
        }

	if (ob->query_int() < 30)
	{
		command("sneer");
		command("say 凭你的悟性能领悟什么？");
		return;
	}

        if (ob->query_skill("tianhuan-shenjue", 1) < 140
           && ob->query_skill("riyue-xinfa", 1) < 140)
        {
                command("hmm");
                command("say 你连本门最基本的内功都没修好，怎么学习上乘武学。");
                return;
        }

        command("haha");
        command("say 看来你也是性情中人，今日老夫便收你为徒。");
        command("say 日月神教一统江湖的千秋大业，就全靠你们了。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_bian()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "日月神教")
                return "给我滚开，少在老夫面前罗嗦！";

        if (me->query("family/master_id") != "ren woxing"
           && me->query("family/master_id") != "xiang wentian")
                return "哼，在教中恐怕还轮不到你说话！";

        if (me->query("shen") > -100000)
                return "你这样心慈手软干不了大事，这神索你不用也罢。";

        if (me->query_skill("panlong-suo", 1) < 140)
                return "你连霹雳盘龙索都没学好，就算神兵在手又有何用？";

        ob = find_object(CHILONG);
        if (! ob) ob = load_object(CHILONG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "嗯？赤龙金索现在不就是你拿着吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，赤龙金索我已经借出去了。";

                if (owner->query("family/family_name") == "日月神教")
                        return "老夫的赤龙金索现在是" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "老夫的赤龙金索现在落入了" + owner->query("name") +
                               "之手，你去把它取回来吧！";
        }
        ob->move(this_object());

        command("nod");
        command("say 你拿去用吧。");
        command("give chilong jinsuo to " + me->query("id"));

        ob = new("/clone/weapon/changbian");
        ob->move(this_object());
        ob->wield();
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/panlong-suo/chan"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("panlong-suo", 1) < 1)
                return "你连霹雳盘龙索都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 500)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -120000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 180)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("panlong-suo", 1) < 120)
                return "你的霹雳盘龙索还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "点了点头，随即便将$N" HIY "招至身边"
                     "，在耳旁低声细说良久，$N" HIY "听后会心的一笑，看来"
                     "大有所悟。\n\n" NOR, me, this_object()); 

        command("nod2");
        command("say 刚才我说的全是此招的精要，可要记牢了。");
        tell_object(me, HIC "你学会了「跗骨缠魂」。\n" NOR);
        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("panlong-suo"))
                me->improve_skill("panlong-suo", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/panlong-suo/chan", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/panlong-suo/sha"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("panlong-suo", 1) < 1)
                return "你连霹雳盘龙索都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1500)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -160000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 220)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("panlong-suo", 1) < 180)
                return "你的霹雳盘龙索还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "对$N" HIY "赞许地点了点头，道：“既"
                     "然你有心为本教出力，今日老夫便传你此招，可看好了。"
                     "”说完$n" HIY "招了招手，$N" HIY "连忙迎上前去，只"
                     "见$n" HIY "轻声在$N" HIY "说了些话，接着手中长索一"
                     "抖，登时幻出漫天鞭影，宛如蛟龙通天，无数鞭影向四面"
                     "八方劲点而去。\n\n" NOR, me, this_object()); 

        command("nod2");
        command("say 招式便是如此，能否领悟就看你自己了。");
        tell_object(me, HIC "你学会了「绝命七杀」。\n" NOR);
        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("panlong-suo"))
                me->improve_skill("panlong-suo", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/panlong-suo/sha", 1);
        me->add("gongxian", -1500);

        return 1;
}

void unconcious()
{
        die();
}
