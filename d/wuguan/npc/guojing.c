#include <ansi.h>
inherit NPC;

inherit F_COAGENT;

void create()
{
        set_name("郭靖", ({ "guo jing", "guo", "jing" }));
        set("nickname", HIY "北侠" NOR);
        set("title", "襄阳城大将");
        set("gender", "男性");
        set("age", 41);
        set("long", @LONG
他就是人称北侠的郭靖，既是蒙古成吉思汗的金刀
驸马，又是江南七怪、全真派马钰道长、「北丐」
洪七公和「老顽童」周伯通等人的徒弟，身兼数门
武功。他身着一件灰色长袍，体态魁梧，敦厚的面
目中透出一股威严令人不由得产生一股钦佩之情。
LONG);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 40);
        set("int", 14);
        set("con", 40);
        set("dex", 40);
        set("max_qi", 8000);
        set("max_jing", 6000);
        set("neili", 8000);
        set("max_neili", 8000);
        set("jiali", 300);
        set("combat_exp", 4000000);
        set("score", 200000);
         
        set_skill("force", 320);
        set_skill("xiantian-gong", 320);
        set_skill("yijin-duangu", 320);
        set_skill("guoshi-xinfa", 280);
        set_skill("dodge", 300);
        set_skill("feiyan-zoubi", 280);
        set_skill("jinyan-gong", 300);
        set_skill("shexing-lifan", 300);
        set_skill("unarmed", 300);
        set_skill("changquan", 300);
        set_skill("strike", 320);
        set_skill("xianglong-zhang", 320);
        set_skill("sword", 280);
        set_skill("yuenv-jian", 280);
        set_skill("parry", 320);
        set_skill("literate", 120);
        set_skill("zuoyou-hubo", 400);
        set_skill("martial-cognize", 320);
        set_skill("craft-cognize", 280);

        map_skill("force", "yijin-duangu");
        map_skill("strike", "xianglong-zhang");
        map_skill("unarmed", "changquan");
        map_skill("sword", "yuenv-jian");
        map_skill("dodge", "shexing-lifan");
        map_skill("parry", "xianglong-zhang");

        prepare_skill("strike", "xianglong-zhang");

        set("chat_chance", 1);
        set("chat_msg", ({
                CYN "郭靖叹了口气道：蒙古兵久攻襄阳不下，一定会再出诡计。\n" NOR,
        }));

        set("inquiry", ([
                "周伯通" : "你见到我周大哥了？他现在可好？",
                "老顽童" : "周大哥一贯这样，没点正经。",
                "洪七公" : "师父除了吃，就是喜欢玩。到处玩，还是为了找吃的。",
                "黄药师" : "那是我泰山大人。他云游四海，神龙见首不见尾的。",
                "欧阳锋" : "这个老毒物，害死我六位师父，一待襄阳事了，决不与他干休。",
                "黄蓉"   : "蓉儿是我的爱妻，你问她做甚？",
                "蓉儿"   : "蓉儿就是蓉儿了。你问这么多干嘛？",
                "郭芙"   : "这个女儿，又笨又不听话。",
                "郭襄"   : "襄儿生于乱世，这辈子又多艰厄。但愿她能快乐一世。",
                "郭破虏" : "那是我的小儿子。",
                "杨过"   : "过儿确实有出息。",
                "马钰"   : "马道长于我有半师之谊。",
                "丘处机" : "邱道长义薄云天，是真豪杰。",
                "柯镇恶" : "那是我大师父。",
                "朱聪"   : "那是我二师父。",
                "韩宝驹" : "那是我三师父。",
                "南希仁" : "那是我四师父。",
                "张阿生" : "那是我五师父。",
                "全金发" : "那是我六师父。",
                "韩小莹" : "那是我七师父。",
                "丐帮"   : "丐帮英雄几百年了，守卫襄阳多亏了他们。\n",
                "拜师"   : "现在蒙古人围攻襄阳，我哪有心情收徒啊！\n",
                "工作"   : "…嗯…这个你去找齐儿吧，他会帮你安排的。",
                "练功"   : "东西练武场都可以练的，你去那练吧。",
                "一灯大师" : "在下对大师好生感激。",
        ]));

        create_family("郭府", 1, "北侠");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
		(: command("perform strike.fei twice") :),
		(: command("perform strike.hui twice") :),
		(: command("perform strike.zhen twice") :),
		(: command("perform strike.qu and strike.hui") :),
		(: command("perform strike.fei and strike.hui") :),
		(: command("perform strike.zhen and strike.hui") :),
		(: command("perform strike.zhen and strike.fei") :),
                (: exert_function, "shield" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        set_temp("apply/damage", 300);
        set_temp("apply/unarmed_damage", 300);
        set_temp("apply/armor", 500);

        setup();

        if (! clonep(this_object()))
        {
                move("/d/wuguan/guofu_dating");
                message_vision(CYN "\n$N" CYN "走了过来，环顾四"
                               "周，深深叹了口气。\n" NOR,
                               this_object());
                set("startroom", "/d/wuguan/guofu_dating");
        }
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
     	object ob;
     	::init();

     	if (interactive(ob = this_player())
           && userp(ob)
	   && ! ob->query_temp("mark/guofu_wait")
           && ! is_fighting())
	{
        	if (ob->query("mark/guofu_over"))
		{
            		command("hmm");
            		command("say 我不是让你另谋出路吗？又跑回来干嘛？");
            		command("say 敦儒，修文，送" + ob->name() + NOR + CYN "出去！");
            		message_vision(HIC "\n只见$N" HIC "一招手，顿时从正厅进来了两"
                                       "位青年，将$n" HIC "架了出去。\n\n",
                                       this_object(), ob);
            		ob->move("/d/xiangyang/westjie1");
            		tell_room(environment(ob), HIC "\n只见两位青年架着" + ob->name() +
                                                   HIC "从郭府大厅走了过来。\n" NOR, ({ ob }));
            	} else
        	if (ob->query("mark/guofu_out")
		   && (int)ob->query("combat_exp") < 100000)
		{
            		command("say 你现在的武功已经有一定的底子了，应该多走动走动。");
            		command("say 别老是呆在我这里，这对你帮助不大。敦儒，修文，送客！");
            		message_vision(HIC "\n只见$N" HIC "一招手，顿时从正厅进来了两"
                                       "位青年，将$n" HIC "送了出去。\n\n",
                                       this_object(), ob);
            		ob->move("/d/xiangyang/westjie1");
            		tell_room(environment(ob), HIC "\n只见两位青年陪着" + ob->name() +
                                                   HIC "从郭府大厅走了过来。\n" NOR, ({ ob }));
            	} else
        	if ((int)ob->query("combat_exp") > 100000)
		{
            		command("say 现在国难当头，蒙古人围攻襄阳，我这里事情繁多。");
            		command("say 恕郭某无礼，还请阁下回去。敦儒，修文，送客！");
            		message_vision(HIC "\n只见$N" HIC "一招手，顿时从正厅进来了两"
                                       "位青年，将$n" HIC "送了出去。\n\n",
                                       this_object(), ob);
            		ob->move("/d/xiangyang/westjie1");
            		tell_room(environment(ob), HIC "\n只见两位青年陪着" + ob->name() +
                                                   HIC "从郭府大厅走了过来。\n" NOR, ({ ob }));
            	} else
         	if ((int)ob->query_condition("killer"))
		{
            		command("sigh");
            		command("say 你杀性如此之重，我这里也留不得你，你还是走吧。");
            		command("say 敦儒，修文，送客！");
            		message_vision(HIC "\n只见$N" HIC "一招手，顿时从正厅进来了两"
                                       "位青年，将$n" HIC "架了出去。\n\n",
                                       this_object(), ob);
            		ob->move("/d/xiangyang/westjie1");
            		ob->set("mark/guofu_over", 1);
			ob->delete("mark/guofu_ok");
            		tell_room(environment(ob), HIC "\n只见两位青年架着" + ob->name() +
                                                   HIC "从郭府大厅走了过来。\n" NOR, ({ ob }));
            	} else
                // 隐藏情节：郭靖教授三门特殊武功
         	if (ob->query("mark/guofu_ok")                //① 确认被收容于郭府
		   && (int)ob->query("mark/guofu_job") > 200      //② 郭府工作总量大于两百
		   && (int)ob->query("combat_exp") > 12500        //③ 确认经验值12.5K和40K之间
                   && (int)ob->query("combat_exp") < 40000
		   && ! ob->query_temp("job_name")                //④ 此时没有领取工作
		   && ! ob->query("family/family_name")           //⑤ 没有拜师
		   && ! ob->query("can_learn/3skills/guojing")    //⑤ 保证以前未触发此情节
		   && ! stringp(ob->query_skill_mapped("force"))) //⑥ 没有激发特殊内功
		{
	                command("look " + ob->query("id"));
            		command("yi");
                	command("whisper " + ob->query("id") + " 你在我郭府内工作也有"
                                "一定的时间\n了，怎么连一技之长也没有？以后怎能行走江"
                                "湖啊？…嗯…这\n样好了，从今日起，你每天到我这里来，"
                                "我传授你几项简单的\n特殊武功好了。\n" NOR);
			ob->set("can_learn/3skills/guojing", 1);
            	}
         }
}

void attempt_apprentice(object ob)
{
        command("sigh");
        command("say 现在蒙古人围攻襄阳，我哪有心情收徒啊。");
        return;
}

int recognize_apprentice(object ob, string skill)
{
        if (! ob->query("can_learn/3skills/guojing"))
        {
                command("say 现在蒙古人围攻襄阳，我哪有心情授课啊。");
                command("say 等你将来拜师之后你师父自然会教你，不用心急。");
                return -1;
        }

        if (ob->query("combat_exp") > 40000)
        {
                command("say 你经验也不低了，应该多出去锻炼，呆在这对你帮助不大。\n");
                return -1;
        }

        if (skill != "force"
           && skill != "guoshi-xinfa"
	   && skill != "dodge"
           && skill != "feiyan-zoubi"
           && skill != "unarmed"
           && skill != "changquan")
        {
                command("shake");
                command("say 我最多传授你几项较为基本的特殊技能，复杂了你领悟不了。");
                command("say 你可以跟我学郭氏心法、飞檐走壁、太祖长拳和一些基本技能。\n");
                return -1;
        }

        if (! ob->query_temp("can_learn/guojing"))
        {
                command("nod2");
                command("say 念你勤奋刻苦，我便传授你一些技能，可要认真记好了。");
                ob->set_temp("can_learn/guojing", 1);
        }
        return 1;
}

void unconcious()
{
        die();
}
