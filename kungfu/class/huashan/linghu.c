// linghu.c 令狐冲

#include <ansi.h>
#include "qizong.h"

inherit NPC;
inherit F_MASTER;

mixed ask_me();
mixed learn_chongling();

void create()
{
	set_name("令狐冲", ({ "linghu chong", "linghu", "chong" }));
	set("nickname", "大师兄");
	set("long", "他身材较瘦，长的浓眉阔眼，气宇暄昂，在同门中排行老大，\n"
                    "是华山派年轻一代中的顶尖好手。\n");
	set("gender", "男性");
	set("age", 28);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 30);
	set("int", 40);
	set("con", 30);
	set("dex", 30);
	
	set("qi", 4800);
	set("max_qi", 4800);
	set("jing", 2400);
	set("max_jing", 2400);
	set("neili", 5700);
	set("max_neili", 5700);
	set("jiali", 60);

	set("combat_exp", 2200000);
	set("score", 150000);

	set_skill("blade", 200);
	set_skill("cuff", 200);
	set_skill("feiyan-huixiang", 200);
	set_skill("strike", 200);
	set_skill("huashan-zhang",200);
	set_skill("unarmed",200);
	set_skill("huashan-quan",120);
	set_skill("force", 200);
	set_skill("yijinjing", 200);
	set_skill("dodge", 200);
	set_skill("parry", 220);
	set_skill("sword", 240);
	set_skill("huashan-jian", 240);
        set_skill("chongling-jian", 240);
	set_skill("dugu-jiujian", 240);
	set_skill("literate", 140);
        set_skill("tanqin-jifa", 240);
        set_skill("xiaoao-jianghu", 240);
        set_skill("qingxin-pushan", 240);

	map_skill("force", "yijinjing");
	map_skill("unarmed", "huashan-quanfa");
	map_skill("strike", "huashan-zhangfa");
	map_skill("dodge", "feiyan-huixiang");
	map_skill("parry", "huashan-jian");
	map_skill("sword", "dugu-jiujian");
        map_skill("tanqin-jifa", "xiaoao-jianghu");

	create_family("华山派", 14, "弟子");

	set("inquiry", ([
		"风清扬" : "唉，已经很久没有见到他老人家了。你问这干嘛？",
		"任盈盈" : "你要干什么？想找麻烦吗？",
                "清心普善咒" : "这可是莹莹交给我的...",
                "笑傲江湖"   : "这是曲洋长老和刘正风师叔留下来的...唉！",
		"琴谱"       : (: ask_me :),
                "冲灵剑法"   : (: learn_chongling :),
     	]));

	set("no_teach", ([
		"yijinjing"    : "此乃少林秘传，蒙方正大师传授，我不能擅自教你。",
		"dugu-jiujian" : "风老先生传我九剑的时候我立下誓言不得私"
				 "自传授，你还是学习其他武功吧！",
	]));

	set("music_book", 1);
	setup();	 	
	carry_object("/d/heimuya/npc/obj/cloth")->wear();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/d/heimuya/npc/obj/card2");
}

int recognize_apprentice(object me, string skill)
{
        if (skill != "tanqin-jifa" &&
            skill != "xiaoao-jianghu" &&
            skill != "qingxin-pushan")
        {
                command("say 对不起...我不能传授你这些，你要是想学点操琴技术还差不多。");
                return -1;
        }

        if (me->query_temp("can_learn/linghu/" + skill))
                return 1;

        me->set_temp("can_learn/linghu/" + skill, 1);
        command("say 好吧，你既然对" + to_chinese(skill) +
                "有兴趣，我就教你一点。");

        return 1;
}

void attempt_apprentice(object ob)
{

        command("say 我一生最喜欢逍遥自在，想入华山派还是找我师傅吧！");
        return ;
}

mixed ask_me()
{
	object me;
	object ob;

	me = this_player();
	if (query("music_book") < 1)
		return "我的琴谱已经借出去了。\n";

	ob = new("/clone/book/qin");
	ob->move(me, 1);
	message_vision("$n把琴谱给了$N，道：你拿去好好学习吧。\n",
		       me, this_object());
	set("music_book", 0);
	return 1;
}

void reset()
{
	set("music_book", 1);
}

void unconcious()
{
        die();
}

mixed learn_chongling()
{
        object me = this_player();
        int lv = me->query_skill("huashan-jian", 1);

        if (me->query_skill("chongling-jian"))
               return "你不是已经会了吗？\n";

        if (me->query("family/family_name") != "华山派")
               return "你说什么，我不明白！\n";
 
        if (lv < 100)
               return "你华山剑法修为不够，我还不能传你这招！\n";

        message_vision(HIW "$N" HIW "说道：“这套剑法是我和小师妹练剑的时候突发奇想"
                       "创出来的，乃是从华山剑法中演化出来！你可看好了！”说完将「冲"
                       "灵剑法」冲头到尾地给$n" HIW "演示了一遍！\n" NOR,
                       this_object(), me);        
        
        command("haha");
        tell_object(me, HIG "你学会了「冲灵剑法」！\n" NOR);

        command("say 领会了多少就看你华山剑法的修为了，剩下的就靠你自己下去练习！");

        me->set_skill("chongling-jian", lv / 10);
        
        return 1;       
}