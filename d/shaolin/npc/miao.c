// miao.c 苗人凤

#include <ansi.h>

inherit NPC;

string ask_me();
string ask_book();
string ask_hujia_book();

void create()
{
        set_name("苗人凤", ({ "miao renfeng", "miao" }));
        set("gender", "男性");
        set("nickname", YEL "金面佛" NOR);
        set("age", 37);
        set("long", @LONG
他看上去脸色透黄，似乎蒙了一层淡淡的金纸。身材高大魁梧，确
是全然不修篇幅，令人称奇。
LONG );
        set("attitude", "peaceful");
        set("str", 32);
        set("int", 31);
        set("con", 33);
        set("dex", 31);
    
        set("qi", 4500);
        set("max_qi", 4500);
        set("jing", 2200);
        set("max_jing", 2200);
        set("neili", 4800);
        set("max_neili", 4800);
        set("jiali", 120);
        set("combat_exp", 2200000);

        set_skill("force", 220);
        set_skill("hunyuan-yiqi", 220);
        set_skill("sword", 230);
        set_skill("miaojia-jian", 230);
        set_skill("dodge", 210);
        set_skill("feiyan-zoubi", 210);
        set_skill("strike", 225);
        set_skill("tianchang-zhang", 225);
        set_skill("parry", 230);

        map_skill("force", "hunyuan-yiqi");
        map_skill("sword", "miaojia-jian");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("parry", "miaojia-jian");
        map_skill("strike", "tianchang-zhang");

        prepare_skill("strike", "tianchang-zhang");

        set("inquiry", ([
                "胡一刀": (: ask_me :),
                "打遍天下无敌手" : "这话说说而已，岂能当真？",
        ]));

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

string ask_me()
{
        object /*ob,*/ me;

        me = this_player();
        if (me->query("family/family_name") != "关外胡家")
                return "这人真是一条汉子！可惜啊可惜！\n";

        return "当年不幸中了奸人毒计伤了他，令人遗憾终生！你既然是"
               "胡家的后人，可对我苗家剑法感兴趣？";
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "关外胡家")
        {
                command("say 你这算是什么意思？要是比划就放马过来！");
                return -1;
        }

        if (skill != "miaojia-jian" && skill != "sword")
        {
                command("say 我只传你剑法，你如果不感兴趣就不要浪费时间了。");
                return -1;
        }

        if (! ob->query_temp("can_learn/miao"))
        {
                command("say 好！你既然感兴趣，那就要看仔细了！");
                ob->set_temp("can_learn/huyizhi", 1);
        }

        return 1;
}