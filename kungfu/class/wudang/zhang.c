// zhang.c 张三丰

#include <ansi.h>
#include "wudang.h"

#define ZHENWU_SWORD    "/clone/lonely/zhenwu"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_jian();
mixed ask_jiuyang();
mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();
mixed ask_skill7();
mixed ask_skill8();
mixed ask_skill9();
mixed ask_skill10();
mixed ask_skill11();

int try_to_learn_jy();

void create()
{
  object ob;
	set_name("张三丰", ({ "zhang sanfeng", "zhang", "sanfeng" }));
	set("nickname", HIW "太极真人" NOR);
	set("long", "他就是武当派开山鼻祖、当今武林的泰山北斗张\n"
                    "三丰真人。只见他身着一身污秽的灰色道袍，不\n"
                    "修边幅。身材高大，年满百岁，满脸红光，须眉\n"
                    "皆白。\n");
	set("gender", "男性");
	set("age", 100);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("str", 31);
	set("int", 39);
	set("con", 40);
	set("dex", 32);

	set("max_qi", 10000);
	set("max_jing", 10000);
  set("max_jingli", 10000);
  set("jingli", 10000);
	set("max_neili", 12000);
	set("neili", 12000);
	set("jiali", 250);
	set("combat_exp", 5000000);
	set("score", 1200000);

	set_skill("force", 420);
  set_skill("taiji-shengong", 420);
  set_skill("wudang-jiuyang", 200);
	set_skill("wudang-xinfa", 400);
	set_skill("dodge", 420);
	set_skill("tiyunzong", 420);
	set_skill("unarmed", 420);
	set_skill("taiji-quan", 420);
	set_skill("xuangong-quan", 400);
	set_skill("strike", 400);
	set_skill("wudang-zhang", 400);
	set_skill("yitian-zhang", 400);
	set_skill("zhenshan-zhang", 400);
  set_skill("hand", 400);
  set_skill("paiyun-shou", 400);
  set_skill("claw", 400);
  set_skill("huzhua-shou", 400);
	set_skill("parry", 420);
	set_skill("sword", 420);
	set_skill("wudang-jian", 400);
	set_skill("shenmen-jian", 400);
	set_skill("rouyun-jian", 400);
	set_skill("raozhi-roujian", 400);
	set_skill("liangyi-jian", 400);
  set_skill("taiji-jian", 420);
	set_skill("blade", 400);
	set_skill("taiji-dao", 400);
	set_skill("xuanxu-dao", 400);
  set_skill("throwing", 400);
  set_skill("furong-jinzhen", 400);
	set_skill("taoism", 400);
	set_skill("literate", 280);
	set_skill("medical", 240);
	set_skill("wudang-yaoli", 240);
  set_skill("martial-cognize", 400);

	map_skill("force", "taiji-shengong");
	map_skill("dodge", "tiyunzong");
	map_skill("unarmed", "taiji-quan");
	map_skill("hand", "paiyun-shou");
	map_skill("claw", "huzhua-shou");
	map_skill("strike", "wudang-zhang");
	map_skill("parry", "taiji-jian");
	map_skill("sword", "taiji-jian");
	map_skill("blade", "taiji-dao");
  map_skill("throwing"  , "furong-jinzhen");
  map_skill("medical", "wudang-yaoli");

	prepare_skill("unarmed", "taiji-quan");
	prepare_skill("strike", "wudang-zhang");

  set("no_teach", ([
          "wudang-jiuyang" : (: try_to_learn_jy :),
  ]));

	create_family("武当派", 1, "开山祖师");
	set("class", "taoist");

  set("inquiry", ([
          "真武剑"     : (: ask_jian :),
          "觉远"       : (: ask_jiuyang :),
          "九阳真经"   : (: ask_jiuyang :),
          "九阳神功"   : (: ask_jiuyang :),
          "武当九阳功" : (: ask_jiuyang :),
          "鹤嘴劲"     : (: ask_skill1 :),
          "震字诀"     : (: ask_skill2 :),
          "引字诀"     : (: ask_skill3 :),
          "挤字诀"     : (: ask_skill4 :),
          "粘字诀"     : (: ask_skill5 :),
          "太极图"     : (: ask_skill6 :),
          "缠字诀"     : (: ask_skill7 :),
          "随字诀"     : (: ask_skill8 :),
          "驾字诀"     : (: ask_skill9 :),
          "剑轮岚转"   : (: ask_skill10 :),
          "真武除邪"   : (: ask_skill11 :),
  ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.chan" :),
		(: perform_action, "sword.jia" :),
		(: perform_action, "sword.sui" :),
		(: perform_action, "sword.zhuan" :),
		(: perform_action, "sword.zhenwu" :),
    (: perform_action, "unarmed.tu" :),
    (: perform_action, "unarmed.zhen" :),
    (: perform_action, "unarmed.zhan" :),
    (: perform_action, "unarmed.ji" :),
    (: perform_action, "unarmed.yin" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "shield" :),
	}) );

	setup();

  if (clonep())
  {
          ob = find_object(ZHENWU_SWORD);
          if (! ob) ob = load_object(ZHENWU_SWORD);
          if (! environment(ob))
          {
                  ob->move(this_object());
                  ob->wield();
          } else
          {
                  ob = new("/clone/weapon/changjian");
                  ob->move(this_object());
                  ob->wield();
          }
  }

	carry_object("/d/wudang/obj/greyrobe")->wear();
}

void attempt_apprentice(object ob)
{
  if (! permit_recruit(ob))
          return;

	if ((int)ob->query_skill("wudang-xinfa", 1) < 120)
	{
		command("say 我武当派乃内家武功，最重视内功心法。");
		command("say " + RANK_D->query_respect(ob) +
			"是否还应该在武当心法上多下点功夫？");
		return;
	}

	if ((int)ob->query("shen") < 80000)
	{
		command("say 学武之人，德义为先，功夫的高低倒还在其次，未练武，要先学做人。");
		command("say 在德行方面，" + RANK_D->query_respect(ob) +
			"是否还做得不够？");
		return;
	}

	if ((int)ob->query("combat_exp") < 500000)
	{
		command("say 你现在经验尚浅，不能领会高深的武功，先锻炼要紧。");
		return;
	}

  if (ob->query_skill("taoism", 1) < 120)
	{
		command("say 我武当派武功全从道藏悟出。");
		command("say 你对道家心法的领悟还不够。");
		command("say " + RANK_D->query_respect(ob) + "还是多研究研究道学心法吧。");
		return;
	}

	if (ob->query_int() < 32)
	{
		command("say 我武当派武功极需靠自己领悟。");
		command("say 要能达到炉火纯青之境，体质什么的倒是无关紧要，悟性却是半点也马虎不得。");
		command("say " + RANK_D->query_respect(ob) + "的悟性还大有潜力可挖，还是请回吧。");
		return;
	}

	command("smile");
	command("say 想不到老道在垂死之年，又觅得一个可塑之才，真是可喜可贺。");
	command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-shengong/dian"))
                return "我不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-shengong", 1) < 1)
                return "你连太极神功都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 800)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 150000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-shengong", 1) < 100)
                return "你的太极神功修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_sort(HIY "\n$n" HIY "微微一笑，伸出一指，出手如风，陡然"
                     "点在$N" HIY "耳缘三分处，$N" HIY "顿时只觉$n" HIY
                     "内力的源源不绝，澎湃涌入，全身一阵酸麻，不禁大惊"
                     "失色。\n\n" NOR, me, this_object());

        command("say 你懂了吗？");
        tell_object(me, HIC "你学会了「鹤嘴劲点龙跃窍」。\n" NOR);
        if (me->can_improve_skill("force"))
                me->improve_skill("force", 1500000);
        if (me->can_improve_skill("taiji-shengong"))
                me->improve_skill("taiji-shengong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-shengong/dian", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-quan/zhen"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-quan", 1) < 1)
                return "你连太极拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 100000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-quan", 1) < 150)
                return "你的太极拳修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_sort(HIY "\n$n" HIY"当不答话，缓缓站起身来，两臂慢慢提"
                     "起至胸前，左臂半环，掌面对成阴掌，右掌翻过成阳掌"
                     "，至揽雀尾、单鞭、提手上势、如封似闭、十字手、抱"
                     "虎归山……一招一式演了下去。当$n" HIY "使到上步高"
                     "探马，上步揽雀尾，单鞭而合太极，神定气闲的站在当"
                     "地。最后$n" HIY "双手合抱太极圈，这才向$N" HIY
                     "问道：“这套拳术中「虚灵顶劲、涵胸拔背、松腰垂臀"
                     "、沉肩坠肘」的诀窍，你又做到了多少？”\n\n" NOR,
                     me, this_object());

        command("say 纯以意行，最忌用力，形神合一，是这路拳法的要旨。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「震字诀」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("taiji-quan"))
                me->improve_skill("taiji-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-quan/zhen", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-quan/yin"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-quan", 1) < 1)
                return "你连太极拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 100000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-quan", 1) < 150)
                return "你的太极拳修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_sort(HIY "\n$n" HIY"当不答话，缓缓站起身来，两臂慢慢提"
                     "起至胸前，左臂半环，掌面对成阴掌，右掌翻过成阳掌"
                     "，至揽雀尾、单鞭、提手上势、如封似闭、十字手、抱"
                     "虎归山……一招一式演了下去。当$n" HIY "使到上步高"
                     "探马，上步揽雀尾，单鞭而合太极，神定气闲的站在当"
                     "地。最后$n" HIY "双手合抱太极圈，这才向$N" HIY
                     "问道：“这套拳术中「虚灵顶劲、涵胸拔背、松腰垂臀"
                     "、沉肩坠肘」的诀窍，你又做到了多少？”\n\n" NOR,
                     me, this_object());

        command("say 用意不用力，太极圆转，无使自断绝。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「引字诀」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("taiji-quan"))
                me->improve_skill("taiji-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-quan/yin", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-quan/ji"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-quan", 1) < 1)
                return "你连太极拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 120000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-quan", 1) < 150)
                return "你的太极拳修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_sort(HIY "\n$n" HIY"当不答话，缓缓站起身来，两臂慢慢提"
                     "起至胸前，左臂半环，掌面对成阴掌，右掌翻过成阳掌"
                     "，至揽雀尾、单鞭、提手上势、如封似闭、十字手、抱"
                     "虎归山……一招一式演了下去。当$n" HIY "使到上步高"
                     "探马，上步揽雀尾，单鞭而合太极，神定气闲的站在当"
                     "地。最后$n" HIY "双手合抱太极圈，这才向$N" HIY
                     "问道：“这套拳术中「虚灵顶劲、涵胸拔背、松腰垂臀"
                     "、沉肩坠肘」的诀窍，你又做到了多少？”\n\n" NOR,
                     me, this_object());

        command("say 当牢记借力而生，着力而发，反施其身。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「挤字诀」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("taiji-quan"))
                me->improve_skill("taiji-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-quan/ji", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-quan/zhan"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-quan", 1) < 1)
                return "你连太极拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 500)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 140000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-quan", 1) < 150)
                return "你的太极拳修为太浅，修炼好了再来吧。";

        if (me->query("max_neili") < 1200)
                return "你的内力修为太浅，修炼高了再来吧。";

        message_sort(HIY "\n$n" HIY"当不答话，缓缓站起身来，两臂慢慢提"
                     "起至胸前，左臂半环，掌面对成阴掌，右掌翻过成阳掌"
                     "，至揽雀尾、单鞭、提手上势、如封似闭、十字手、抱"
                     "虎归山……一招一式演了下去。当$n" HIY "使到上步高"
                     "探马，上步揽雀尾，单鞭而合太极，神定气闲的站在当"
                     "地。最后$n" HIY "双手合抱太极圈，这才向$N" HIY
                     "问道：“这套拳术中「虚灵顶劲、涵胸拔背、松腰垂臀"
                     "、沉肩坠肘」的诀窍，你又做到了多少？”\n\n" NOR,
                     me, this_object());

        command("say 你只需懂得太极图圆转不断、阴阳变化之意即可。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「粘字诀」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("taiji-quan"))
                me->improve_skill("taiji-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-quan/zhan", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-quan/tu") >= 10)
                return "该学的你都已经学了，以后要善加利用！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-quan", 1) < 1)
                return "你连太极拳都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 3000)
                return "你为我武当派效力还不够，这招我不忙传你。";

        if (me->query("shen") < 250000)
                return "你行侠仗义的事情做得还不够多，我不能放心传你绝招！";

        if (me->query_skill("taiji-quan", 1) < 250)
                return "你的太极拳法还不到家，要多练练！";

        if (me->query_skill("taiji-shengong", 1) < 300)
                return "你的太极神功还不到家，好好修行吧！";

        if (me->query_skill("taoism", 1) < 300)
                return "你的道学心法研究的还不够明白，要下功夫苦学才是！";

        if (me->query("max_jingli") < 1000)
                return "你的精力不济，就算传给你太极图你也难以运用。";

        message_sort(HIY "\n$n" HIY "点点头，双手轻轻划了一个圈子，地上"
                     "土雾无端吸起，又渐渐落下。\n" NOR, me,
                     this_object());

        command("say 你看懂了多少？");

        if (me->query("potential") < me->query("learned_points") + 100)
        {
                write("你看了半天，没有研究出什么新"
                      "的东西，看来是潜能还不够！\n");
                return 1;
        }

        me->add("learned_points", 100);

        if (me->add("can_perform/taiji-quan/tu", 1) < 10)
        {
                message_vision(HIY "$N" HIY "迷迷茫茫的点了"
                               "点头，深思良久。\n\n" NOR, me);
                tell_object(me, HIC "你对太极图有了一点领悟。\n" NOR);
        } else
        {
                message_sort(HIY "$N" HIY "脸露笑容，喜道：我已经明白了"
                             "，所谓真与幻象其实并无分别啊！$n" HIY "哈"
                             "哈长笑道：明白就好，明白就好，以后勿得轻易"
                             "使用，你去吧。\n\n", me, this_object());

                tell_object(me, HIC "你学会了道家密技「太极图」。\n" NOR);
                if (me->can_improve_skill("taoism"))
                        me->improve_skill("taoism", 1500000);
                if (me->can_improve_skill("taoism"))
                        me->improve_skill("taoism", 1500000);
                if (me->can_improve_skill("taoism"))
                        me->improve_skill("taoism", 1500000);
                if (me->can_improve_skill("force"))
                        me->improve_skill("force", 1500000);
                if (me->can_improve_skill("force"))
                        me->improve_skill("force", 1500000);
                if (me->can_improve_skill("force"))
                        me->improve_skill("force", 1500000);
                if (me->can_improve_skill("taiji-shengong"))
                        me->improve_skill("taiji-shengong", 1500000);
                if (me->can_improve_skill("taiji-shengong"))
                        me->improve_skill("taiji-shengong", 1500000);
                if (me->can_improve_skill("taiji-shengong"))
                        me->improve_skill("taiji-shengong", 1500000);
                if (me->can_improve_skill("unarmed"))
                        me->improve_skill("unarmed", 1500000);
                if (me->can_improve_skill("unarmed"))
                        me->improve_skill("unarmed", 1500000);
                if (me->can_improve_skill("unarmed"))
                        me->improve_skill("unarmed", 1500000);
                if (me->can_improve_skill("taiji-quan"))
                        me->improve_skill("taiji-quan", 1500000);
                if (me->can_improve_skill("taiji-quan"))
                        me->improve_skill("taiji-quan", 1500000);
                if (me->can_improve_skill("taiji-quan"))
                        me->improve_skill("taiji-quan", 1500000);
	        me->improve_skill("martial-cognize", 1500000);
        	me->add("gongxian", -3000);
        }
        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-jian/chan"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-jian", 1) < 1)
                return "你连太极剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 80000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-jian", 1) < 80)
                return "你的太极剑法还不到家，要多练练！";

        message_sort(HIY "\n$n" HIY "微微笑了笑，伸出一指，以指作剑，开"
                     "始慢慢的演示剑招。从起手势一直到五十三式「指南针」"
                     "，双手同时画圆，复成第五十四式「持剑归原」。直待一"
                     "套剑法演示完毕，$n" HIY "这才向$N" HIY "问到：“这"
                     "太极剑招中的剑意，你又明白了多少？”\n\n" NOR, me,
                     this_object());

        command("haha");
        command("say 你只需记住剑意无定，绵绵不绝便成。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「缠字诀」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("taiji-jian"))
                me->improve_skill("taiji-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-jian/chan", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill8()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-jian/sui"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-jian", 1) < 1)
                return "你连太极剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 200)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 80000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-jian", 1) < 60)
                return "你的太极剑法还不到家，要多练练！";

        message_sort(HIY "\n$n" HIY "微微笑了笑，伸出一指，以指作剑，开"
                     "始慢慢的演示剑招。从起手势一直到五十三式「指南针」"
                     "，双手同时画圆，复成第五十四式「持剑归原」。直待一"
                     "套剑法演示完毕，$n" HIY "这才向$N" HIY "问到：“这"
                     "太极剑招中的剑意，你又明白了多少？”\n\n" NOR, me,
                     this_object());

        command("haha");
        command("say 讲究从心而发，从心而收，便能圆转如意。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「随字诀」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("taiji-jian"))
                me->improve_skill("taiji-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-jian/sui", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill9()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-jian/jia"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-jian", 1) < 1)
                return "你连太极剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 100000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-jian", 1) < 150)
                return "你的太极剑法还不到家，要多练练！";

        message_sort(HIY "\n$n" HIY "微微笑了笑，伸出一指，以指作剑，开"
                     "始慢慢的演示剑招。从起手势一直到五十三式「指南针」"
                     "，双手同时画圆，复成第五十四式「持剑归原」。直待一"
                     "套剑法演示完毕，$n" HIY "这才向$N" HIY "问到：“这"
                     "太极剑招中的剑意，你又明白了多少？”\n\n" NOR, me,
                     this_object());

        command("haha");
        command("say 借力打力，四两拨千斤，是之为太极。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「驾字诀」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("taiji-jian"))
                me->improve_skill("taiji-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-jian/jia", 1);
        me->add("gongxian", -600);

        return 1;
}

mixed ask_skill10()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-jian/zhuan"))
                return "你自己慢慢体会吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-jian", 1) < 1)
                return "你连太极剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 800)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 120000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-jian", 1) < 160)
                return "你的太极剑法还不到家，要多练练！";

        message_sort(HIY "\n$n" HIY "微微笑了笑，伸出一指，以指作剑，开"
                     "始慢慢的演示剑招。从起手势一直到五十三式「指南针」"
                     "，双手同时画圆，复成第五十四式「持剑归原」。直待一"
                     "套剑法演示完毕，$n" HIY "这才向$N" HIY "问到：“这"
                     "太极剑招中的剑意，你又明白了多少？”\n\n" NOR, me,
                     this_object());

        command("haha");
        command("say 心无拘囿，以意驭剑。");
        command("say 道理便是如此，下去后慢慢体会吧。");
        tell_object(me, HIC "你学会了「剑轮岚转」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("taiji-jian"))
                me->improve_skill("taiji-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-jian/zhuan", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_skill11()
{
        object me;

        me = this_player();
        if (me->query("can_perform/taiji-jian/zhenwu"))
                return "自己好好多练习吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们武当派的人，何出此言？";

        if (me->query_skill("taiji-jian", 1) < 1)
                return "你连太极剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 2000)
                return "你为我武当派效力还不够，这招我先不忙传你。";

        if (me->query("shen") < 120000)
                return "你行侠仗义的事情做的还很不够，我不能传你绝招！";

        if (me->query_skill("taiji-jian", 1) < 180)
                return "你的太极剑法还不到家，要多练练！";

        message_sort(HIY "\n$n" HIY "微微颔首，随手拣起一根树枝向$N" HIY
                     HIY "扫来，$N" HIY "见来招平淡无奇，心中颇为疑惑，"
                     "只是随手一挡。忽然只见$n" HIY "剑势大变，气度非凡"
                     "，变化无穷，$N" HIY "大吃一惊，慌乱不迭。\n\n" NOR,
                     me, this_object());

        command("haha");
        command("say 你可明白了？");
        tell_object(me, HIC "你学会了「真武除邪」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("taiji-jian"))
                me->improve_skill("taiji-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/taiji-jian/zhenwu", 1);
        me->add("gongxian", -2000);

        return 1;
}

mixed ask_jian()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_bad())
        {
                if (me->query("family/family_name") == "武当派")
                        message_vision(CYN "$N" CYN "大怒，对$n" CYN "道：“你身为武当弟子，"
                                       "反而误入魔道，还不快快醒转？”\n" NOR,
                                       this_object(), me);
                else
                        message_vision(CYN "$N" CYN "大怒，对$n" CYN "喝道：“好一个邪魔外"
                                       "道，居然敢窥测真武剑？”\n" NOR,
                                       this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "武当派")
                return "真武剑是我们武当镇派之宝，你打听它干什么？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才能用真武剑，你还是请回吧。";

        if (me->query("shen") < 60000)
                return "你行侠仗义的事情做得不够，我不能把真武剑交给你。";

        ob = find_object(ZHENWU_SWORD);
        if (! ob) ob = load_object(ZHENWU_SWORD);
	owner = environment(ob);
        while (owner)
	{
                if (owner->is_character() || ! environment(owner))
                        break;
		owner = environment(owner);
	}

        if (owner == me)
                return "真武剑不是在你的手中么，怎么反而来找我呢？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "我已经把真武剑借出去了。";

                if (owner->query("family/master_id") == query("id"))
                        return "真武剑现在在" + owner->query("name") +
                               "手中，你要想用就去找他吧。";
                else
                        return "真武剑现在落在" + owner->query("name") +
                               "手中，你去把他找回来吧。";
        }

        ob->move(this_object());
        message_vision(CYN "$N" CYN "点点头道：“好，你用这真武剑要多做一些行"
		       "侠仗义的事情！”\n" NOR, this_object(), me);
        command("give zhenwu jian to " + me->query("id"));
        return 1;
}

int accept_object(object me, object ob)
{
        int r;
        if (r = ::accept_object(me, ob))
                return r;

        if (base_name(ob) != ZHENWU_SWORD)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("family/master_id") != query("id"))
                command("say 多谢这位" + RANK_D->query_respect(me) + "将真武剑交回。");
        else
                command("say 很好，很好！");
        destruct(ob);
        return 1;
}

mixed ask_jiuyang()
{
        // object ob;
        object me;
        me = this_player();

        if (me->query("can_learn/jiuyang-shengong/wudang"))
                return "老道已经答应传授你武当九阳功了，你怎么还那么罗嗦？";

        if (! me->query("can_learn/jiuyang-shengong/kunlun"))
                return "昔日《九阳真经》在我师父觉远大师手中丢失，现在也不知道流落何方。";

        if (! me->query("can_learn/jiuyang-shengong/shaolin"))
                return "唉，如果当时能够追回《九阳真经》，觉远大师也不至于落难。";

        message_vision(CYN "\n张三丰仔细打量了$N" CYN "好一阵，目光陡然一亮。\n\n" NOR, me);

        command("say 你不就是当年还送经书予觉远大师之人吗？");
        command("say 所谓‘大恩不言谢’，这九阳神功老道倒是通晓一点，现已化为武当九阳功。");
        command("say 如果阁下不嫌弃，老道倒是可以将这套九阳功传授于你。");

        tell_object(me, HIC "张三丰同意传授你「武当九阳功」。\n" NOR);

        if (me->can_improve_skill("martial-cognize"))
	        me->improve_skill("martial-cognize", 1500000);

        me->set("can_learn/jiuyang-shengong/wudang", 1);
        return 1;
}

int try_to_learn_jy()
{
        object me = this_player();

        if (! me->query("can_learn/jiuyang-shengong/wudang"))
        {
                if (me->query("family/master_id") != query("id"))
                {
	                command("say 武当九阳神功乃是九阳神功的分支，我少"
                                "年时得师父觉远大师所授。");
	                command("say 但阁下与贫道素不相识，怎谈得上“指点"
                                "”二字？");
        	        return -1;
                } else
                {
	                command("say 武当九阳神功乃是九阳神功的分支，我少"
                                "年时得师父觉远大师所授。");
	                command("say 虽然这武功在我手里有所改动，但它还是"
                                "少林的武功，就算是我的弟子也不传授。");
	                return -1;
                }
        }

        if (me->query_skill("wudang-jiuyang") > 180)
        {
                command("say 你的武当九阳功力已颇为深厚了，以后你就自己研究吧。");
                return -1;
        }

        if (me->query("shen") < 0)
        {
                command("say 老道倒是有心传你九阳功，可是你中邪魔外道如此之深。");
                command("say 等你改过自新后再来找老道我吧。");
                return -1;
        }
        return 0;
}

int recognize_apprentice(object me, string skill)
{
        if (! me->query("can_learn/jiuyang-shengong/wudang"))
        {
                if (me->query("family/master_id") != query("id"))
                {
	                command("say 武当九阳神功乃是九阳神功的分支，我少"
                                "年时得师父觉远大师所授。");
	                command("say 但阁下与贫道素不相识，怎谈得上“指点"
                                "”二字？");
        	        return -1;
                } else
                {
	                command("say 武当九阳神功乃是九阳神功的分支，我少"
                                "年时得师父觉远大师所授。");
	                command("say 虽然这武功在我手里有所改动，但它还是"
                                "少林的武功，就算是我的弟子也不传授。");
	                return -1;
                }
        }

        if (skill != "wudang-jiuyang")
        {
                command("say 武学杂而不精也是无用，你还是专心学习武当九阳功吧。");
                return -1;
        }
        return 1;
}

void unconcious()
{
        die();
}
