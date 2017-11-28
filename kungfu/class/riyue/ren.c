#include <ansi.h>
#include "riyue.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();

mixed  try_to_learn_xixingdafa();

void create()
{
        set_name("任我行", ({ "ren woxing", "ren", "woxing" }));
        set("nickname", HIW "我行我素" NOR);
        set("title", "日月神教教主");
        set("long", @LONG 
这便是日月神教上任教主任我行。只见他一张
长长的脸孔雪白，更无半分血色。他眉目清秀，
身材甚高，一头黑发，穿的是一袭青衫。
LONG);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 65);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 40);
        set("int", 40);
        set("con", 40);
        set("dex", 40);
        
        set("max_qi", 7000);
        set("max_jing", 5000);
        set("neili", 9000);
        set("max_neili", 9000);
        set("jiali", 200);
        set("combat_exp", 4000000);
        set("score", 50000);

        set_skill("force", 340);
        set_skill("xixing-dafa", 340);
        set_skill("tianhuan-shenjue", 320);
        set_skill("riyue-xinfa", 320);
        set_skill("dodge", 320);
        set_skill("feiyan-zoubi", 320);
        set_skill("juechen-shenfa", 320);
        set_skill("strike", 340);
        set_skill("guzhuo-zhang", 340);
        set_skill("qingmang-zhang", 320);
        set_skill("hand", 320);
        set_skill("lansha-shou", 320);
        set_skill("cuff", 320);
        set_skill("zhenyu-quan", 320);
        set_skill("claw", 320);
        set_skill("poyue-zhao", 320);
        set_skill("parry", 320);
        set_skill("sword", 340);
        set_skill("yuanshi-jian", 340);
        set_skill("taishan-sword", 300);
        set_skill("hengshan-jian", 300);
        set_skill("hengshan-sword", 300);
        set_skill("huashan-jian", 300);
        set_skill("songshan-sword", 300);
        set_skill("blade", 280);
        set_skill("danding-dao", 280);
        set_skill("throwing", 280);
        set_skill("heixue-shenzhen", 280);
        set_skill("martial-cognize", 320);
        set_skill("literate", 320);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "xixing-dafa");
        map_skill("strike", "guzhuo-zhang");
        map_skill("sword", "yuanshi-jian");
        map_skill("parry", "guzhuo-zhang");
        map_skill("hand", "lansha-shou");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");
        map_skill("blade", "danding-dao");
        map_skill("throwing", "heixue-shenzhen");

        prepare_skill("strike", "guzhuo-zhang");

        set("no_teach", ([
                "xixing-dafa"   : (: try_to_learn_xixingdafa :),
                "taishan-sword"  : "你给我好好专研本门武功，五岳剑派的剑法学它作甚？",
                "hengshan-jian"  : "你给我好好专研本门武功，五岳剑派的剑法学它作甚？",
                "hengshan-sword" : "你给我好好专研本门武功，五岳剑派的剑法学它作甚？",
                "huashan-jian"  : "你给我好好专研本门武功，五岳剑派的剑法学它作甚？",
                "songshan-sword" : "你给我好好专研本门武功，五岳剑派的剑法学它作甚？",
        ]));

        create_family("日月神教", 13, "教主");

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("inquiry", ([
                "天地归元" : (: ask_skill1 :),
                "天旋地转" : (: ask_skill2 :),
                "大巧若拙" : (: ask_skill3 :),
                "大智若愚" : (: ask_skill4 :),
                "反璞归真" : (: ask_skill5 :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.gui" :),
		(: perform_action, "sword.xuan" :),
                (: perform_action, "strike.zhuo" :),
                (: perform_action, "strike.yu" :),
                (: perform_action, "strike.zhen" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "suck" :),
	}) );

        setup();
        carry_object("/d/heimuya/npc/obj/zaohong")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -80000)
        {
                command("sneer");
                command("say 老夫平生最痛恨的就是你这样的假仁假义之徒。");
                return;
        }

        if (ob->query("combat_exp") < 500000)
        {
                command("say 你现在江湖经验太浅，还是先跟随几位长老学习吧。");
                return;
        }

	if (ob->query_int() < 34)
	{
		command("hmm");
		command("say 你悟性那么差，怎么领会我的武功？");
		return;
	}

        if (ob->query_skill("tianhuan-shenjue", 1) < 150
           && ob->query_skill("riyue-xinfa", 1) < 150)
        {
                command("hmm");
                command("say 你连本门最基本的内功都没修好，怎么学习上乘武学。");
                return;
        }

        command("nod2");
        command("say 念在你如此有心，对本教又忠心耿耿，今日我便收你为徒。");
        command("say 我日月神教一统江湖的千秋大业，就全靠你们了。");
        command("recruit " + ob->query("id"));
        return;
}

mixed try_to_learn_xixingdafa()
{
        object ob = this_player();

        if (ob->query("can_learn/xixing-dafa/ren"))
                return 0;

        if (ob->query_skill("force", 1) > 180)
        {
                command("say 你此时的功力已颇为深厚，今日我就传你吸星大法。");
	        command("whisper " + ob->query("id") + " 压抑内力反噬的口诀"
                        "是%X&$&$%$$#$#，可记好了。");
                ob->set("can_learn/xixing-dafa/ren", 1);
                return 0;
        }

        return "你此时功力太浅，强修此功会走火入魔。";
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yuanshi-jian/gui"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("yuanshi-jian", 1) < 1)
                return "你连原始剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 500)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -120000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("yuanshi-jian", 1) < 140)
                return "你的原始剑法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "点了点头，随即便将$N" HIY "招至身边"
                     "，在耳旁低声细说良久，$N" HIY "听后会心的一笑，看来"
                     "大有所悟。\n\n" NOR, me, this_object()); 

        command("nod2");
        command("say 刚才我说的全是此招的精要，可要记牢了。");
        tell_object(me, HIC "你学会了「天地归元」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("yuanshi-jian"))
                me->improve_skill("yuanshi-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yuanshi-jian/gui", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/yuanshi-jian/xuan"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("yuanshi-jian", 1) < 1)
                return "你连原始剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1400)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -130000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 260)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("yuanshi-jian", 1) < 180)
                return "你的原始剑法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "微微一笑，从怀中轻轻取出了一本剑谱"
                     "，指着其中一段对$N" HIY "细说良久，$N" HIY "一边听"
                     "一边不住地点头。\n\n" NOR, me, this_object());

        command("nod");
        command("say 你只需记住‘以快打慢、制人机先’这八个字便成。");
        tell_object(me, HIC "你学会了「天旋地转」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("yuanshi-jian"))
                me->improve_skill("yuanshi-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yuanshi-jian/xuan", 1);
        me->add("gongxian", -1400);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/guzhuo-zhang/zhuo"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("guzhuo-zhang", 1) < 1)
                return "你连古拙掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -120000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query("max_neili") < 1800)
                return "你的内力太差，怎么修炼上乘武功？";

        if (me->query_skill("force") < 220)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("guzhuo-zhang", 1) < 150)
                return "你的古拙掌法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "冷笑一声，更不答话，只是随手挥出一掌"
                     "，毫无半点招式可言。可哪知这看似不经意的一掌，竟激得"
                     "周围尘沙四起，掌风呼啸而至，直刮得$N" HIY "面庞隐隐"
                     "生疼。招式之巧，实乃$N" HIY "前所未闻。\n\n" NOR, me,
                     this_object());

        command("nod");
        command("say 明白了吗？");
        tell_object(me, HIC "你学会了「大巧若拙」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("guzhuo-zhang"))
                me->improve_skill("guzhuo-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/guzhuo-zhang/zhuo", 1);
        me->add("gongxian", -600);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/guzhuo-zhang/yu"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("guzhuo-zhang", 1) < 1)
                return "你连古拙掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1200)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -150000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query("max_neili") < 2800)
                return "你的内力太差，怎么修炼上乘武功？";

        if (me->query_skill("force") < 260)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("guzhuo-zhang", 1) < 180)
                return "你的古拙掌法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "大笑数声，对$N" HIY "赞道：“想不到你"
                     "的掌法居然已达如此造诣，今日老夫传你这招又有何妨？”"
                     "$n" HIY "随即摆开架势，慢慢的演示招数。\n\n" NOR, me,
                     this_object());

        command("haha");
        command("say 只需明白了这个道理，这招大愚掌便已练成了。");
        tell_object(me, HIC "你学会了「大智若愚」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("guzhuo-zhang"))
                me->improve_skill("guzhuo-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/guzhuo-zhang/yu", 1);
        me->add("gongxian", -1200);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/guzhuo-zhang/zhen"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("guzhuo-zhang", 1) < 1)
                return "你连古拙掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 2200)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -200000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (! me->query("can_perform/guzhuo-zhang/zhuo")
           || ! me->query("can_perform/guzhuo-zhang/yu"))
                return "你连前两招都未练成，怎么学这最后一招？";

        if (me->query("max_neili") < 3600)
                return "你的内力太差，怎么修炼上乘武功？";

        if (me->query_skill("force") < 300)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("guzhuo-zhang", 1) < 220)
                return "你的古拙掌法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "对$N" HIY "微微点了点头，沉声说道："
                     "“看来你这套古拙掌法已经练得相当纯熟了，今日老夫就"
                     "传你这招。”说完便将$N" HIY "招至跟前细说良久，陡然"
                     "间只见$n" HIY "忽然探出右手，平推而出，$N" HIY "只"
                     "觉掌风澎湃，凌厉之极，顿时胸口一阵郁闷，难受得说不"
                     "出话来。\n\n" NOR, me, this_object());

        command("haha");
        command("say 两招合一便是新招，你明白了吗？");
        tell_object(me, HIC "你学会了「反璞归真」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("guzhuo-zhang"))
                me->improve_skill("guzhuo-zhang", 1500000);
        if (me->can_improve_skill("guzhuo-zhang"))
                me->improve_skill("guzhuo-zhang", 1500000);
        if (me->can_improve_skill("guzhuo-zhang"))
                me->improve_skill("guzhuo-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/guzhuo-zhang/zhen", 1);
        me->add("gongxian", -2200);

        return 1;
}