#include <ansi.h>
inherit NPC;

string ask_me();

void create()
{
        set_name("程灵素", ({ "cheng lingsu", "cheng" }));
        set("gender", "女性");
        set("age", 24);
        set("long", @long
她看上去双眉紧锁，不知道有什么心事，长得相貌平平，并不出众。
身材瘦小，穿着粗布衣衫。
long);
        set("attitude", "peaceful");
        set("str", 22);
        set("int", 35);
        set("con", 31);
        set("dex", 27);
        set("chat_chance", 10);
        set("chat_msg", ({
                "程灵素哀哀的叹了口气。\n",
        }));

        set("qi", 2500);
        set("max_qi", 2500);
        set("jing", 1200);
        set("max_jing", 1200);
        set("neili", 2800);
        set("max_neili", 2800);
        set("jiali", 40);
        set("combat_exp", 400000);
     
        set_skill("force", 150);
        set_skill("poison", 270);
        set_skill("dispel-poison", 270);
	set_skill("medical", 270);
	set_skill("yaowang-miaoshu", 270);

        set("inquiry",([
                "胡斐":     "他...他...\n",
                "袁紫衣":   "我...你提他干什么？\n"
        ]));

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}

int recognize_apprentice(object me, string skill)
{
       // if (me->query("family/family_name") != "药王谷")
        if (me->query("family/family_name") != "关外胡家")
        {
                command("say 你是谁？来干什么？");
                return -1;
        }

        if (skill != "poison" && skill != "dispel-poison" &&
	    skill != "medical" && skill != "yaowang-miaoshu")
	    
        {
                command("say 我只会毒功和医术，别的我就没法子教你啦！");
                return -1;
        }

        if ((int)me->query("shen") < 0)
        {
                command("sigh");
                command("say 你怎能走上邪路？我可不能教你。");
                return -1;
        }

        if (! me->query_temp("can_learn/cheng/poison"))
        {
                me->set_temp("can_learn/cheng/poison", 1);
                command("say 看在胡斐的面子上，我就教你一点本事吧，你可要好自为之！");
                return 1;
        }

        return 1;
}
