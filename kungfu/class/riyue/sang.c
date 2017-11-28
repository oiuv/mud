#include <ansi.h>
#include "riyue.h"

inherit NPC;
inherit F_MASTER;

mixed ask_me();
mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

void create()
{
	set_name("桑三娘", ({ "sang sanniang", "sang", "sanniang"}));
        set("title", "日月神教天香堂长老");
        set("nickname", HIR "掌刑使者" NOR);
        set("long", @LONG
这是日月神教天香堂香主桑三娘。只见她神情
古怪，面无丝毫微笑，面容却相当清秀。
LONG);
	set("gender", "女性" );
        set("class", "scholar");
        set("age", 41);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 4000);
        set("max_jing", 3000);
        set("neili", 5400);
        set("max_neili", 5400);
        set("jiali", 150);
        set("combat_exp", 2000000);
        set("score", 10000);

        set_skill("force", 180);
        set_skill("riyue-xinfa", 180);
        set_skill("tianhuan-shenjue", 180);
        set_skill("dodge", 200);
        set_skill("feiyan-zoubi", 200);
        set_skill("juechen-shenfa", 200);
        set_skill("dagger", 180);
        set_skill("jifeng-cixuefa", 180);
        set_skill("hand", 200);
        set_skill("lansha-shou", 200);
        set_skill("strike", 160);
        set_skill("qingmang-zhang", 160);
        set_skill("cuff", 140);
        set_skill("zhenyu-quan", 140);
        set_skill("claw", 140);
        set_skill("poyue-zhao", 140);
        set_skill("parry", 180);
        set_skill("throwing", 200);
        set_skill("heixue-shenzhen", 200);
        set_skill("martial-cognize", 180);
        set_skill("literate", 220);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("dagger", "jifeng-cixuefa");
        map_skill("hand", "lansha-shou");
        map_skill("parry", "lansha-shou");
        map_skill("strike", "qingmang-zhang");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");
        map_skill("throwing", "heixue-shenzhen");

        prepare_skill("hand", "lansha-shou");

        set("no_teach", ([
                "tianhuan-shenjue" : "这门内功你还是去让其他长老教你吧。",
        ]));

        create_family("日月神教", 13, "天香堂长老");

        set("inquiry", ([
                "黑血神针" : (: ask_me :),
                "破靛神砂" : (: ask_skill1 :),
                "星罗棋布" : (: ask_skill2 :),
                "天蝎藏针" : (: ask_skill3 :),
        ]));

        set("zhen_count", 3);

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
                (: perform_action, "hand.po" :),
                (: perform_action, "throwing.luo" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
	}) );

        setup();

        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
        set_temp("handing", carry_object("/d/heimuya/npc/obj/shenzhen"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -15000)
        {
                command("sneer");
                command("say 你为人如此正直，干嘛又来我日月神教？");
                return;
        }

        if (ob->query("combat_exp") < 100000)
        {
                command("say 你现在江湖经验太浅，还应该多走动走动。");
                return;
        }

        if (ob->query_skill("tianhuan-shenjue", 1) < 50
           && ob->query_skill("riyue-xinfa", 1) < 50)
        {
                command("hmm");
                command("say 你怎么连本门最基本的内功都没学好？");
                return;
        }

        command("say 。……嗯……那你就跟着我吧。");
        command("say 日月神教内规矩众多，可少给我惹事。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_me()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我滚开！少在我面前罗嗦。";

        if ((int)me->query("shen") > -30000)
                return "像你这样心慈手软，拿了这神针去也没什么用。";

        if ((int)me->query_skill("heixue-shenzhen", 1) < 140)
                return "你黑血神针的手法还不到家，拿了这神针去也没什么用。";

        if (query("zhen_count") < 1)
                return "我又不是卖这个的，哪里带得了那么多。";

        add("zhen_count", -1);
        ob = new("/d/heimuya/npc/obj/shenzhen");
        message_vision("$N拿出五十根" WHT "黑血神针" NOR "(Heixue shenzhen)给$n。\n",
                       this_object(), me);
        ob->move(me, 1);
        return "我这儿的黑血神针你先拿去用吧。";
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/lansha-shou/po"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("lansha-shou", 1) < 1)
                return "你连蓝砂手都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -20000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("lansha-shou", 1) < 100)
                return "你的蓝砂手还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "对$N" HIY "笑了笑，也不答话，突然"
                     "间身形急转，宛若鬼魅，悄然伸出五指朝$N" HIY "胸前"
                     "抓落，$N" HIY "见状大惊失色，连忙腾挪闪躲，可已然"
                     "不及。$n" HIY "五指正好拂在$N" HIY "的胸前。\n\n"
                     NOR, me, this_object()); 

        command("haha");
        command("say 这式手法用来暗算或是偷袭再合适不过。");
        tell_object(me, HIC "你学会了「破靛神砂」。\n" NOR);
        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("lansha-shou"))
                me->improve_skill("lansha-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/lansha-shou/po", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/heixue-shenzhen/luo"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("heixue-shenzhen", 1) < 1)
                return "你连黑血神针都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -35000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("heixue-shenzhen", 1) < 140)
                return "你的黑血神针还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "阴阴一笑，将$N" HIY "招至跟前，轻"
                     "声在耳旁秘密说了些什么。随后又伸出右手，十指箕张"
                     "，一伸一缩，看样子是一种很特别的暗器法门。\n\n"
                     NOR, me, this_object()); 

        command("nod");
        command("say 刚才我说的全是精要，你可要记清楚了。");
        tell_object(me, HIC "你学会了「星罗棋布」。\n" NOR);
        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("heixue-shenzhen"))
                me->improve_skill("heixue-shenzhen", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/heixue-shenzhen/luo", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jifeng-cixuefa/cang"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("jifeng-cixuefa", 1) < 1)
                return "你连疾风刺穴法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -15000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 120)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("dodge") < 120)
                return "你的轻功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("jifeng-cixuefa", 1) < 100)
                return "你的疾风刺穴法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，随即便从$N"
                     HIY "的手中接过匕首，一声叱喝，连环刺出五招，只"
                     "见这五刺连环攻势凌厉之极，招数层出不穷，当真精"
                     "妙无比。\n\n" NOR, me, this_object()); 

        command("nod");
        command("say 这招的要点不过一个疾字，其实是很简单的招式。");
        tell_object(me, HIC "你学会了「天蝎藏针」。\n" NOR);
        if (me->can_improve_skill("dagger"))
                me->improve_skill("dagger", 1500000);
        if (me->can_improve_skill("jifeng-cixuefa"))
                me->improve_skill("jifeng-cixuefa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jifeng-cixuefa/cang", 1);
        me->add("gongxian", -200);

        return 1;
}
