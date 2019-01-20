
#include <ansi.h>
#include <command.h>
#include "/kungfu/skill/eff_msg.h";

inherit NPC;
inherit F_MASTER;

mixed ask_kuihua();
mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();

int p, j;

void create()
{
	set_name(HIR "东方不败" NOR, ({ "dongfang bubai", "dongfang", "bubai" }));
	set("long", " 她就是东方不败，看起来不男不女，样子却甚为妖媚。\n");
	set("gender", "无性");
	set("age", 30);
	set("shen_type", -1);
	set("str", 51);
	set("int", 39);
	set("con", 50);
	set("dex", 62);

	set("max_qi", 10000);
	set("max_jing", 10000);
  set("max_jingli", 10000);
  set("jingli", 10000);
	set("max_neili", 12000);
	set("neili", 12000);
	set("jiali", 550);
	set("combat_exp", 5000000);
	set("score", 1200000);

	set_skill("force", 450);
  set_skill("parry", 450);
  set_skill("dodge", 450);
  set_skill("sword", 450);
  set_skill("unarmed", 450);
  set_skill("literate", 350);
  set_skill("martial-cognize", 400);
  set_skill("kuihua-mogong", 450);

	map_skill("force", "kuihua-mogong");
	map_skill("dodge", "kuihua-mogong");
	map_skill("unarmed", "kuihua-mogong");
	map_skill("sword", "kuihua-mogong");
  map_skill("parry", "kuihua-mogong");

	prepare_skill("unarmed", "kuihua-mogong");

	create_family("日月神教", 2, "弟子");

  set("inquiry", ([
          "杨莲亭"    :    "莲弟 ……\n",
          "任我行"    :    "哼 ……，我当初真该杀了他。\n",
          "葵花魔功"  :    (: ask_kuihua :),
          "无声无息"  :    (: ask_skill1 :),
          "无穷无尽"  :    (: ask_skill2 :),
          "无边无际"  :    (: ask_skill3 :),
          "无法无天"  :    (: ask_skill4 :),
          "无双无对"  :    (: ask_skill5 :),

  ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "dodge.sheng" :),
		(: perform_action, "sword.bian" :),
		(: perform_action, "sword.tian" :),
		(: perform_action, "sword.qiong" :),
		(: perform_action, "sword.zhenwu" :),
    (: perform_action, "dodge.sheng" :),
    (: perform_action, "unarmed.bian" :),
    (: perform_action, "unarmed.tian" :),
    (: perform_action, "unarmed.qiong" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
		(: exert_function, "shield" :),
		(: exert_function, "roar" :),
	}) );

	setup();

  carry_object(__DIR__"zhen")->wield();
	carry_object(__DIR__"changpao")->wear();
}

mixed ask_kuihua()
{
        object ob = this_object();
        object me = this_player();
        int lv = me->query_skill("pixie-jian", 1);

        if (me->query_temp("teach_kh"))
        {
            command("shake");

            return 1;
        }
        //转世特技六阴鬼脉免除无性限制 by 薪有所属
       if (! me->query("special_skill/guimai"))
       	{
        if (me->query("gender") != "无性")
        {
             command("heng");
             ob->kill_ob(me);
             return 1;
        }
         }
        if (lv < 300)
        {
             if (me->query_skill("kuihua-mogong", 1))
             {
                     command("say 下去好好练习，别来烦我！");
                     return 1;
             }
             command("say 滚开！就凭你也配问这个？！");
             return 1;
        }

        command("nod");
        command("heihei");
        command("say 好吧，我就传你葵花魔功，你可小心了！");
        tell_object(me, HIG "\n东方不败猛然尖啸一声，声音激荡刺耳，令人心驰神摇。你觉得胸口一震，一口鲜血喷出。\n" NOR);
        tell_object(me, HIC "然而你却无法捕捉到东方不败的动向！\n" NOR);

        me->set_temp("teach_kh", 1);

        if (me->query("qi") < 2000)
        {
              me->unconcious();
              return 1;
        }

        //me->receive_wound("qi", me->query("qi") / 2);
        me->receive_wound("qi", me->query("qi") / 4);
        me->add("neili", -(2000 - lv));
        me->start_busy(2 + random(2));
        p = (int)me->query("qi") * 100 / (int)me->query("max_qi");
        tell_object(me, "(你" + eff_status_msg(p) + ")\n\n");

        j = 0;

        remove_call_out("teach_kuihua");
        call_out("teach_kuihua", 2, me, lv);

        return 1;
}

void teach_kuihua(object me, int lv)
{
        int sz;

        string* teach_words = ({
        HIG "忽然间东方不败身法陡然加快，呼啸着在你周围旋转，你感觉胸闷气短。\n" NOR,
        HIG "霎那间一道银光闪过，东方不败手中银针顿时化分为万千幻影，缠绕在你周围，你渐渐觉得头晕目眩。\n" NOR,
        HIG "渐渐地，东方不败身法越来越快，已化身为无数她的身影，东方不败尖啸一声，从不同的角度向你袭来。\n" NOR,
        HIG "东方不败长袖一拂，一道银光划过，猛然间在你眼前一亮，你顿觉得胸口刺痛无比。\n" NOR,
        });

        if (environment(me) != environment(this_object()))
              return;

        sz = sizeof(teach_words);

        tell_object(me, teach_words[random(sz)]);
        tell_object(me, HIC "然而你却无法捕捉到东方不败的动向！\n" NOR);

        if (me->query("qi") <= (1400 - lv))
        {
               me->unconcious();
               return;
        }

        me->receive_wound("qi", 1400 - lv);
        me->add("neili", -(1600 - lv));
        p = (int)me->query("qi") * 100 / (int)me->query("max_qi");
        tell_object(me, "( 你" + eff_status_msg(p) + ")\n\n");
        j ++;

        // 能学葵花魔功了
        if (j >= 6 + random(2))
        {
              message_sort(HIW "东方不败尖啸一声，又回到了原地，似乎从未离开过。\n" NOR, me);

              message_sort(HIW "东方不败再未有任何言语，只是玩弄着自己的指甲 ……\n" NOR, me);

              if (random(10) > 7)return;

              write(HIM "你仔细回味刚才那惊心动魄的一幕，回想东方不败施展的各种招式，猛然间你一声长叹，"
                        "心中疑虑顿然消除 ……\n" NOR);
              if (me->can_improve_skill("force"))
                    me->improve_skill("force", 1500000);
              if (me->can_improve_skill("dodge"))
                    me->improve_skill("dodge", 1500000);
              if (me->can_improve_skill("parry"))
                    me->improve_skill("parry", 1500000);
              me->improve_skill("martial-cognize", 1500000);

              me->delete_skill("pixie-jian");
              me->delete_temp("teach_kh");

              //if (me->query("can_perform/pixie-jian/po"))
              //         me->set("can_perform/kuihua-mogong/qiong", 1);
              me->set_skill("kuihua-mogong", 250 + (lv - 300) / 2 );
              tell_object(me, HIG "你学会了「葵花魔功」！\n" NOR);
              return;
        }

        remove_call_out("teach_kuihua");
        call_out("teach_kuihua", 3, me, lv);

}

mixed ask_skill1()
{
        object me = this_player();
        //转世特技六阴鬼脉免除无性限制 by 薪有所属
       if (! me->query("special_skill/guimai"))
       	{
        if (me->query("gender") != "无性")
        {
               command("heng");
               this_object()->kill_ob(me);
               return 1;
        }
      }
        if (me->query("can_perform/kuihua-mogong/sheng"))
        {
               command("say 我不是已经传了你这招吗？怎么又来问我！");
               return 1;
        }
        if (me->query_skill("kuihua-mogong", 1) < 200)
        {
               command("say 你葵花魔功还不够娴熟，还不快下去多加练习。");
               return 1;
        }
        command("nod");
        command("heihei");
        tell_object(me, HIR "\n东方不败身子忽进忽退，身形诡秘异常，在你身边飘忽不定，不久又回到了原地。\n");
        command("say 看清楚了？！");
        if (me->can_improve_skill("dodge"))
              me->improve_skill("dodge", 1500000);
        if (me->can_improve_skill("kuihua-mogong"))
              me->improve_skill("kuihua-mogong", 1500000);
        me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/kuihua-mogong/sheng", 1);
        tell_object(me, HIG "你学会了「无声无息」。\n");

        return 1;
}

mixed ask_skill2()
{
        object me = this_player();

//转世特技六阴鬼脉免除无性限制 by 薪有所属
       if (! me->query("special_skill/guimai"))
       	{
        if (me->query("gender") != "无性")
        {
               command("heng");
               this_object()->kill_ob(me);
               return 1;
        }
      }
        if (me->query("can_perform/kuihua-mogong/qiong"))
        {
               command("say 我不是已经传了你这招吗？怎么又来问我！");
               return 1;
        }
        if (me->query_skill("kuihua-mogong", 1) < 250)
        {
               command("say 你葵花魔功还不够娴熟，还不快下去多加练习。");
               return 1;
        }

        command("heihei");
        tell_object(me, HIR "\n东方不败尖啸一声，猛然进步欺前，一招竟直袭向虚空，速度之快，令人称奇。\n" NOR);
        command("say 看清楚了？！");
        command("say 这招精要在于快、准、狠，对于实战经验较低的人可能会一招使其毙命！");
        command("say 你下去一定要勤加练习。");

        if (me->can_improve_skill("force"))
              me->improve_skill("force", 1500000);
        if (me->can_improve_skill("kuihua-mogong"))
              me->improve_skill("kuihua-mogong", 1500000);
        me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/kuihua-mogong/qiong", 1);
        tell_object(me, HIG "你学会了「无穷无尽」。\n");

        return 1;
}

mixed ask_skill3()
{
        object me = this_player();

//转世特技六阴鬼脉免除无性限制 by 薪有所属
       if (! me->query("special_skill/guimai"))
       	{
        if (me->query("gender") != "无性")
        {
               command("heng");
               this_object()->kill_ob(me);
               return 1;
        }
      }
        if (me->query("can_perform/pixie-jian/po"))
        {
               command("say 下去好好练习吧，没事别来烦我！");
               return 1;
        }
        if (me->query_skill("kuihua-mogong", 1) < 260)
        {
               command("say 你葵花魔功还不够娴熟，还不快下去多加练习。");
               return 1;
        }
        command("heihei");
        tell_object(me, HIR "\n东方不败一声尖啸，身体猛然旋转不定，霎那间似乎有千万根银针，齐齐卷向虚空 ……\n" NOR);
        command("say 这招威力巨大，能伤对方丹元，使其短期内不能施展任何外功！");
        command("say 你下去一定要勤加练习。");

        if (me->can_improve_skill("force"))
              me->improve_skill("force", 1500000);
        if (me->can_improve_skill("kuihua-mogong"))
              me->improve_skill("kuihua-mogong", 1500000);
        me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/pixie-jian/po", 1);
        tell_object(me, HIG "你学会了「无边无际」。\n");

        return 1;

}

mixed ask_skill4()
{
        object me = this_player();

 //转世特技六阴鬼脉免除无性限制 by 薪有所属
       if (! me->query("special_skill/guimai"))
       	{
        if (me->query("gender") != "无性")
        {
               command("heng");
               this_object()->kill_ob(me);
               return 1;
        }
      }
        if (me->query("can_perform/kuihua-mogong/tian"))
        {
               command("say 我不是已经传了你这招吗？怎么又来问我！");
               return 1;
        }
        if (me->query_skill("kuihua-mogong", 1) < 220)
        {
               command("say 你葵花魔功还不够娴熟，还不快下去多加练习。");
               return 1;
        }
        command("heihei");
        command("say 看好了！");
        tell_object(me, HIR "\n东方不败默运葵花魔功，身形变得奇快无比，接连从不同的方位向虚空攻出数招！\n" NOR);
        command("say 这招以快取胜，以快制敌。");
        command("say 你下去一定要勤加练习。");

        if (me->can_improve_skill("force"))
              me->improve_skill("force", 1500000);
        if (me->can_improve_skill("kuihua-mogong"))
              me->improve_skill("kuihua-mogong", 1500000);
        me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/kuihua-mogong/tian", 1);
        tell_object(me, HIG "你学会了「无法无天」。\n");

        return 1;
}

/*
mixed ask_skills5()
{
        write("制作中 ……\n");
        return 1;
}
*/
mixed ask_skill5()
{
        object me = this_player();

 //转世特技六阴鬼脉免除无性限制 by 薪有所属
       if (! me->query("special_skill/guimai"))
       	{
        if (me->query("gender") != "无性")
        {
               command("heng");
               this_object()->kill_ob(me);
               return 1;
        }
      }
        if (me->query("can_perform/kuihua-mogong/ws"))
        {
               command("say 我不是已经传了你这招吗？怎么又来问我！");
               return 1;
        }
        if (me->query_skill("kuihua-mogong", 1) < 400)
        {
               command("say 你葵花魔功还不够娴熟，还不快下去多加练习。");
               return 1;
        }

        command("heihei");
        tell_object(me, HIR "\n东方不败尖啸一声，猛然进步欺前，竟然转眼间耍了九十九招，速度之快，着实令人佩服！\n" NOR);
        command("say 看清楚了？！");
        command("say 这招精要在于连贯以及狠，最重要的就是杀人于无形之中！");
        command("say 我教给你的是前半招，后半招需要你自己去体悟。");
        command("say 你下去一定要勤加练习。");

        if (me->can_improve_skill("force"))
              me->improve_skill("force", 1500000);
        if (me->can_improve_skill("kuihua-mogong"))
              me->improve_skill("kuihua-mogong", 1500000);
        me->improve_skill("martial-cognize", 1500000);

        me->set("can_perform/kuihua-mogong/ws", 1);
        tell_object(me, HIG "你学会了「无双无对」之「无双」式！\n");

        return 1;
}

void unconcious()
{
        ::die();
}
