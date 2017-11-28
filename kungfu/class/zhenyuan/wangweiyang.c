#include <ansi.h>
#include "zhenyuan.h"

#define HOUBEI    "/clone/lonely/houbeidao"
#define LETTER    "/clone/special/sjmletter"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_dao();

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();
mixed ask_skill7();

void create()
{
        object ob;
	set_name("王维扬", ({ "wang weiyang", "wang", "weiyang", "wei", "yang"}));
	set("nickname", HIY "威震河朔" NOR);
	set("title", "镇远镖局总镖头");
  	set("gender", "男性");
        set("long", @LONG
这位就是镇远镖局的创始人，有“威震河朔”之
称的王维扬。江湖上有句话叫：“宁碰阎王，莫
碰老王”，这个老王指的就是他。但见他红光满
面，隐隐中又透着紫气，太阳穴微微凸起，便知
乃是八卦门中的鼎尖高手。由于年迈，他已经不
管理镖局中事务了，一门心思放在提高自己的武
功修为上。
LONG );
  	set("age", 68);
	set("class", "fighter");
        set("attitude", "peaceful");
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 5200);
        set("max_jing", 4000);
        set("neili", 5800);
        set("max_neili", 5800);
        set("jiali", 200);
        set("combat_exp", 3500000);

  	set_skill("force", 260);
  	set_skill("nei-bagua", 260);
  	set_skill("bagua-xinfa", 240);
  	set_skill("parry", 260);
  	set_skill("wai-bagua", 260);
  	set_skill("dodge", 240);
  	set_skill("bagua-bu", 240);
  	set_skill("unarmed", 240);
  	set_skill("youshen-zhang", 240);
  	set_skill("strike", 240);
  	set_skill("bagua-zhang", 240);
  	set_skill("bazhen-zhang", 240);
  	set_skill("cuff", 240);
  	set_skill("bagua-quan", 240);
  	set_skill("yanqing-quan", 240);
  	set_skill("blade", 260);
  	set_skill("bagua-dao", 260);
  	set_skill("kuimang-dao", 240);
  	set_skill("throwing", 240);
  	set_skill("bagua-biao", 240);
  	set_skill("literate", 220);
  	set_skill("martial-cognize", 240);

	map_skill("unarmed", "youshen-zhang");
	map_skill("dodge", "bagua-bu");
	map_skill("force", "nei-bagua");
	map_skill("strike", "bazhen-zhang");
	map_skill("blade", "bagua-dao");
	map_skill("cuff", "bagua-quan");
	map_skill("parry", "wai-bagua");
	map_skill("throwing", "bagua-biao");

	prepare_skill("unarmed", "youshen-zhang");
        set("class", "fighter");

  	create_family("八卦门", 1, "掌门");

        set("inquiry", ([
                "厚背紫金刀" : (: ask_dao :),
                "八卦震"     : (: ask_skill1 :),
                "神卦天印"   : (: ask_skill2 :),
                "乾坤一掷"   : (: ask_skill3 :),
                "翻卦连环掌" : (: ask_skill4 :),
                "劈天神芒"   : (: ask_skill5 :),
                "天刀八势"   : (: ask_skill6 :),
                "杀龙无悔"   : (: ask_skill7 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "blade.mang" :),
                (: perform_action, "blade.tian" :),
                (: perform_action, "unarmed.fan" :),
                (: perform_action, "parry.zhen" :),
                (: perform_action, "throwing.zhi" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

  	setup();

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        if (clonep())
        {
                ob = find_object(HOUBEI);
                if (! ob) ob = load_object(HOUBEI);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/gangdao");
                        ob->move(this_object());
                        ob->wield();
                }
        }

  	carry_object("/clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));
}

int accept_fight(object me)
{
  	command("say 这位" + RANK_D->query_respect(me) +
                "，你不是我的对手，我看较量还是免了吧！\n");
  	return 0;
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if (me->query_int() < 35 && me->query_con() < 35)
        {
                command("hmm");
                command("say 你体质孱弱，为人又不机灵，我收下你有什么用？");
                return;
        }

        if (me->query("combat_exp") < 320000)
        {
                command("say 你的江湖经验太差了，我收徒可是件大事，等过段日子再说吧！");
                return;
        }

        if (me->query_skill("bagua-xinfa", 1) < 100)
        {
                command("say 你本门的内功修为太差了，再回去练练吧。");
                return;
        }

        command("haha");
  	command("say 很好，希望你多加努力，好好学习本门武功，他日将八卦门发扬光大。");
        command("recruit " + me->query("id"));

        if ((string)me->query("class") != "fighter")
                me->set("class", "fighter");
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/wai-bagua/zhen"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("wai-bagua", 1) < 1)
                return "你连外八卦都没学，谈什么绝招？";

        if (me->query("gongxian") < 100)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("wai-bagua", 1) < 60)
                return "你的外八卦还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "微微一笑，当下也不答话，只是伸出右手，轻轻放"
                       "在\n$N" HIY "胸口。正当$N" HIY "疑惑间，却见$n" HIY "掌劲"
                       "轻吐，$N" HIY "顿时全身\n一震，如遭电击，各处经脉无不酸麻"
                       "，不禁大惊失色。\n" NOR, me, this_object());

        command("say 明白了么？");
        tell_object(me, HIC "你学会了「八卦震」。\n" NOR);

        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wai-bagua/zhen", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bazhen-zhang/yin"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bazhen-zhang", 1) < 1)
                return "你连八阵八卦掌都没学，谈什么绝招？";

        if (me->query("gongxian") < 500)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 180)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bazhen-zhang", 1) < 130)
                return "你的八阵八卦掌还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "笑了笑，对$N" HIY "点头示意赞许，当下凝神沉"
                       "履，积聚全\n身功力于一掌，携着雷霆之势奋力向$N" HIY "面前"
                       "的一座青铜香炉\n拍落，顿时只听轰然一声闷响，香炉内的香灰"
                       "被$n" HIY "的掌\n力激荡得四处飞扬，尘烟弥漫，待得烟消云散"
                       "，$N" HIY "这才发现\n那座青铜香炉上豁然嵌着一双掌印。\n"
                       NOR, me, this_object());

        command("ke");
        command("nod");
        command("say 这八阵八卦掌是我八卦门绝学，可要勤加练习。");
        tell_object(me, HIC "你学会了「神卦天印」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("bazhen-zhang"))
                me->improve_skill("bazhen-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bazhen-zhang/yin", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-biao/zhi"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-biao", 1) < 1)
                return "你连八卦镖诀都没学，谈什么绝招？";

        if (me->query("gongxian") < 800)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bagua-biao", 1) < 120)
                return "你的八卦镖诀还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "将$N" HIY "招至跟前，轻声在耳旁秘密说了些"
                       "什么。随后又\n伸出右手，十指箕张，一伸一缩，煞是巧妙。"
                       "看样子是一种\n很特别的暗器法门。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 刚才我所说的你可都记牢了？剩下的就是靠自己多加练习。");
        tell_object(me, HIC "你学会了「乾坤一掷」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("bagua-biao"))
                me->improve_skill("bagua-biao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-biao/zhi", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/youshen-zhang/fan"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("youshen-zhang", 1) < 1)
                return "你连游身八卦掌都没学，谈什么绝招？";

        if (me->query("gongxian") < 500)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 160)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("youshen-zhang", 1) < 120)
                return "你的游身八卦掌还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "大笑数声，对$N" HIY "说道：“既然你游身八卦"
                       "掌已有如此\n造诣，我今日便传你这套掌法的精髓。”说完便只"
                       "见$n" HIY "\n脚踏八卦四方之位，身形在全场游走不定，双掌随"
                       "后紧拍而\n出，顿时掌影将$N" HIY "四方各处团团笼罩，$N" HIY
                       "感到在这层层掌影\n之下，竟然连呼吸都不能畅通。\n" NOR, me,
                       this_object());

        command("haha");
        command("say 这招的要诣不过就是一个疾字，你慢慢体会吧。");
        tell_object(me, HIC "你学会了「翻卦连环掌」。\n" NOR);

        if (me->can_improve_skill("dodge"))
                me->improve_skill("dodge", 1500000);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("youshen-zhang"))
                me->improve_skill("youshen-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/youshen-zhang/fan", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-dao/mang"))
                return "我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-dao", 1) < 1)
                return "你连八卦刀法都没学，谈什么绝招？";

        if (me->query_skill("wai-bagua", 1) < 1)
                return "你连外八卦神功都没学，谈什么绝招？";

        if (me->query("gongxian") < 1000)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("bagua-dao", 1) < 140)
                return "你的八卦刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("wai-bagua", 1) < 140)
                return "你的外八卦神功还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 200)
                return "嗯，你的内功火候尚需提高，练好了再来找我吧。";

        message_vision(HIY "$n" HIY "哈哈一笑，在$N" HIY "耳旁轻声嘀咕了几句，"
                       "随即又伸手作\n刀，按照八卦四方之位比划演示。$N" HIY "在"
                       "一旁沉默不语，直到\n演示结束，突然眼睛一亮，似乎在武学"
                       "上又有了新的突破。\n" NOR,
                       me, this_object());
        command("smile");
        command("say 这便是刀芒的要诀，你自己下来勤加练习吧。");
        tell_object(me, HIC "你学会了「劈天神芒」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-dao/mang", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-dao/tian"))
                return "你不是已经学会了吗？怎么，又给忘记了？";

        if (me->query("family/family_name") != query("family/family_name")
            && me->query("family/family_name") != "商家堡")
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query("family/family_name") == "商家堡")
                return "你虽然是商家堡的弟子，但没有你师傅同意我也不能传你这招！";

        if (me->query_skill("bagua-dao", 1) < 1)
                return "你连八卦刀法都没学，谈什么绝招？";

        if (me->query_skill("wai-bagua", 1) < 1)
                return "你连外八卦神功都没学，谈什么绝招？";

        if (me->query_skill("nei-bagua", 1) < 1)
                return "你连内八卦神功都没学，谈什么绝招？";

        if (me->query("gongxian") < 2400)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("bagua-dao", 1) < 200)
                return "你的八卦刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("wai-bagua", 1) < 200)
                return "你的外八卦神功还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("nei-bagua", 1) < 200)
                return "你的内八卦神功还练得不到家，自己下去练练再来吧！";

        if ((int)me->query("max_neili") < 3200)
                return "你的内力修为不足，施展不出这招，等你内力有所攀升后再来找我吧。";

        message_vision(HIY "$n" HIY "微笑着点了点头，对$N" HIY "道：“你来我八卦"
                       "门修行也有\n好长阵子了，可知道何为「八卦」吗？”$N" HIY
                       "想也不想，随口\n答道：“八卦乃天居乾、地居坤、风居巽、云"
                       "居震、飞龙居\n坎、武翼居兑、鸟翔居离、蜿盘居艮。”$n" HIY
                       "听后颇为赞\n许，笑道：“你这是只知其一，不知其二。所谓「"
                       "八卦」的\n真谛乃是一个「阵」字。”$N" HIY "闷了好一会，"
                       "默默思考这一句\n话，突然双目一亮，叫道：“师父，弟子终于"
                       "明白什么是真\n正的「八卦」了！”$n" HIY "大笑道：“你只"
                       "要明白了这个道\n理，那么这八势刀法你就已经学会了。”\n" NOR,
                       me, this_object());

        command("haha");
        tell_object(me, HIC "你学会了「天刀八势」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("nei-bagua"))
                me->improve_skill("nei-bagua", 1500000);
        if (me->can_improve_skill("nei-bagua"))
                me->improve_skill("nei-bagua", 1500000);
        if (me->can_improve_skill("nei-bagua"))
                me->improve_skill("nei-bagua", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-dao/tian", 1);
        me->add("gongxian", -2400);

        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-dao/sha"))
                return "唉…你自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-dao", 1) < 1)
                return "你连八卦刀法都没学，谈什么绝招？";

        if (me->query("gongxian") < 1800)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        //if (me->query("shen") > -80000)
                //return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("bagua-dao", 1) < 180)
                return "你的八卦刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 250)
                return "嗯，你的内功火候尚需提高，练好了再来找我吧。";

        message_vision(HIY "$n" HIY "凝神了$N" HIY "半天，长叹一声，说道：“这一"
                       "招「杀龙无\n悔」杀气过重本来不能轻易传授，但既然你的刀法"
                       "已达此境\n界，今日我就传你这招。”说完，便伸手将$N" HIY
                       "招至身旁，低\n声在$P" HIY "耳畔细说良久。\n" NOR, me,
                       this_object());
        command("sigh");
        command("say 这一招的诀窍就是义无返顾，奋力一击。");
        command("say 要诀我都教你了，自己下去练吧。");
        tell_object(me, HIC "你学会了「杀龙无悔」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-dao/sha", 1);
        me->add("gongxian", -1800);

        return 1;
}

mixed ask_dao()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "八卦门")
                return "厚背紫金八卦刀是我八卦门的至宝，你打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才配用厚背紫金刀，你就忍了吧。";

        if (me->query_skill("bagua-dao", 1) < 120)
                return "你还是下去再练练你的八卦刀法吧。";

        ob = find_object(HOUBEI);
        if (! ob) ob = load_object(HOUBEI);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "咦？厚背紫金刀现在不正是你拿着吗，怎么还反过来问我？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我已经把厚背紫金刀借出去了。";

                if (owner->query("family/family_name") == "八卦门")
                        return "厚背紫金刀在暂时是你同门师兄" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "本门的厚背紫金刀现在落在了" + owner->query("name") +
                               "手中，你要用就去把它夺回来吧！";
        }

        ob->move(this_object());
        message_vision(CYN "$N" CYN "微微笑道：“既然这样，我这柄厚背紫金刀你就"
                       "拿去用吧，行走江湖时用它扬扬咱们的威风！”\n" NOR,
                       this_object(), me);
        command("give houbei dao to " + me->query("id"));
        return 1;
}

int accept_object(object me, object ob)
{
        if (base_name(ob) != HOUBEI
            && base_name(ob) != LETTER)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (base_name(ob) == LETTER)
        {
                if (me->query("can_perform/bagua-dao/tian"))
                {
                     command("shake");
                     command("shit");
                     return 1;
                }
                command("nod");
                command("haha");
                command("say 好，好！既然这样，我就传你这招「天刀八势」！"); 
                message_sort(HIY "\n$n" HIY "微笑着点了点头，对$N" HIY "道：“你"
                             "可知道何为「八卦」吗？”$N" HIY "想也不想，随口答道"
                             "：“八卦乃天居乾、地居坤、风居巽、云居震、飞龙居坎、"
                             "武翼居兑、鸟翔居离、蜿盘居艮。”$n" HIY "听后颇为赞许"
                             "，笑道：“你这是只知其一，不知其二。所谓「八卦」的真"
                             "谛乃是一个「阵」字。”$N" HIY "闷了好一会，默默思考这"
                             "一句话，突然双目一亮，叫道：“师父，弟子终于明白什么"
                             "是真正的「八卦」了！”$n" HIY "大笑道：“你只要明白"
                             "了这个道理，那么这八势刀法你就已经学会了。”\n" NOR,
                             me, this_object());

        command("haha");
        tell_object(me, HIC "你学会了「天刀八势」。\n" NOR);

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("nei-bagua"))
                me->improve_skill("nei-bagua", 1500000);
        if (me->can_improve_skill("nei-bagua"))
                me->improve_skill("nei-bagua", 1500000);
        if (me->can_improve_skill("nei-bagua"))
                me->improve_skill("nei-bagua", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-dao/tian", 1);

        return 1;

        }
        
        else
        {
            if (me->query("family/master_id") != query("id"))
                    command("say 多谢这位" + RANK_D->query_respect(me) + "将厚背紫金刀交回。");
            else
                    command("say 很好，很好！");
                    destruct(ob);
        }
        return 1;
}
