#include <ansi.h>
#include "zhenyuan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
	set_name("王剑英", ({ "wang jianying", "wang", "jianying" }));
        set("long", @LONG
他是镇远镖局总镖头王维扬的大儿子，看上去红
光满面，气宇轩昂，神态自若，便知他内力深厚，
除了他父亲，俨然便是当世八卦门第一高手，八
卦门掌门的继承人。
LONG );
	set("title", "当世八卦门第一高手");
  	set("gender", "男性");
  	set("age", 48);
	set("class", "fighter");
        set("attitude", "peaceful");
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);

        set("max_qi", 3200);
        set("max_jing", 3200);
        set("neili", 3600);
        set("max_neili", 3600);
        set("jiali", 150);
        set("combat_exp", 2500000);

  	set_skill("parry", 160);
  	set_skill("wai-bagua", 160);
  	set_skill("force", 180);
  	set_skill("nei-bagua", 180);
  	set_skill("bagua-xinfa", 160);
  	set_skill("dodge", 160);
  	set_skill("bagua-bu", 160);
  	set_skill("blade", 180);
  	set_skill("bagua-dao", 180);
  	set_skill("kuimang-dao", 160);
  	set_skill("strike", 160);
  	set_skill("bagua-zhang", 160);
  	set_skill("bazhen-zhang", 160);
  	set_skill("cuff", 160);
  	set_skill("bagua-quan", 160);
  	set_skill("throwing", 160);
  	set_skill("bagua-biao", 160);
  	set_skill("literate", 140);
  	set_skill("martial-cognize", 160);

        set("no_teach", ([
                "nei-bagua" : "内八卦神功必须由我父亲亲自传授。",
                "bagua-dao" : "八卦刀法向来便是由我父亲亲自教授。",
        ]));

	map_skill("blade", "bagua-dao");
	map_skill("dodge", "bagua-bu");
	map_skill("force", "nei-bagua");
	map_skill("strike", "bagua-zhang");
	map_skill("cuff", "bagua-quan");
	map_skill("parry", "wai-bagua");
	map_skill("throwing", "bagua-biao");

        prepare_skill("cuff", "bagua-quan");
        prepare_skill("strike", "bagua-zhang");

  	create_family("八卦门", 2, "高手");

        set("inquiry", ([
                "掌中夹镖" : (: ask_skill1 :),
                "镖中现掌" : (: ask_skill2 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.mang" :),
                (: perform_action, "cuff.gua" :),
                (: perform_action, "strike.ding" :),
                (: perform_action, "strike.jia" :),
                (: perform_action, "parry.zhen" :),
                (: perform_action, "throwing.zhi" :),
                (: perform_action, "throwing.xian" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

  	setup();

        carry_object("/clone/weapon/gangdao")->wield();
  	carry_object("/clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));

}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

	if (me->query("combat_exp") < 100000)
    	{
      		command("say 你的江湖经验太差了，还是在镖局里再摸爬滚打一段时间吧！");
      		return;
    	}

        if (me->query_skill("bagua-xinfa", 1) < 80)
        {
                command("say 你本门的内功修为太差，还是练练再说吧。");
                return;
        }

  	command("nod");
  	command("say 既然如此，我就收下你。");
        command("recruit " + me->query("id"));
        if ((string)me->query("class") != "fighter")
                me->set("class", "fighter");
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-zhang/jia"))
                return "该说的我都说完了，还有什么不明白就自己下去练！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-zhang", 1) < 1)
                return "你连八卦掌都没学，谈什么绝招？";

        if (me->query_skill("bagua-biao", 1) < 1)
                return "你连八卦镖都没学，谈什么绝招？";

        if (me->query("gongxian") < 400)
                return "你为镖局出力不够，这招我暂时不忙传你。";

        if (me->query_skill("bagua-zhang", 1) < 120)
                return "你的八卦掌还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("bagua-biao", 1) < 120)
                return "你的八卦镖还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 150)
                return "嗯，你的镖掌都已经娴熟了，但是切记内功火候是基础，这可半点马虎不得。";

        message_vision(HIY "$n" HIY "点了点头，伸手将$N" HIY "招到身边，在耳旁嘀嘀"
                       "咕咕了半\n天，还时不时伸出手比划两下。$N" HIY "一边听一边不"
                       "住的点头称\n是，似乎对$n" HIY "的教导大有感悟。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 该说的我都说了，你自己下去练习吧。");
        tell_object(me, HIC "你学会了「掌中夹镖」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("bagua-zhang"))
                me->improve_skill("bagua-zhang", 1500000);
        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("bagua-biao"))
                me->improve_skill("bagua-biao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-zhang/jia", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-biao/xian"))
                return "嗯？这招不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本镖局素无来往，何出此言？";

        if (me->query_skill("bagua-zhang", 1) < 1)
                return "你连八卦掌都没学，谈什么绝招？";

        if (me->query_skill("bagua-biao", 1) < 1)
                return "你连八卦镖都没学，谈什么绝招？";

        if (me->query("gongxian") < 400)
                return "你为镖局出力不够，这招我暂时不忙传你。";

        if (me->query_skill("bagua-zhang", 1) < 120)
                return "你的八卦掌还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("bagua-biao", 1) < 120)
                return "你的八卦镖还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 200)
                return "嗯，你的镖掌都已经娴熟了，但是切记内功火候是基础，这可半点马虎不得。";

        message_vision(HIY "$n" HIY "看了$N" HIY "半天，赞许的点了点头，对$N" HIY
                       "说道：“既然你\n如此有心，我就给你演示一遍，你可看仔细了！"
                       "”听得话音\n刚落，顿时从$n" HIY "袖底窜出一道金光，直奔$N"
                       HIY "而去，$N" HIY "见\n状立即飞身躲避，可刹那间只见$n" HIY
                       "身形一晃，一双手掌\n已搭在$N" HIY "胸前。$N" HIY "顿时呆立"
                       "当场，半响都说不出话来。\n" NOR, me, this_object());

        command("haha");
        command("say 这招教给你了，但切记我们身在天子脚下，千万别去招惹官府。");
        tell_object(me, HIC "你学会了「镖中现掌」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("bagua-zhang"))
                me->improve_skill("bagua-zhang", 1500000);
        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("bagua-biao"))
                me->improve_skill("bagua-biao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-biao/xian", 1);
        me->add("gongxian", -400);

        return 1;
}