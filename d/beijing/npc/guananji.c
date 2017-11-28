#include <ansi.h>
inherit NPC;
inherit F_UNIQUE;
inherit F_MASTER;
int ask_weiwang();

void create()
{
        set_name("关安基", ({ "guan anji", "guan" }));
        set("title", HIR "天地会"HIG"青木堂"NOR"会众");
        set("title", HIR "天地会"HIG"青木堂"NOR"会众"); 
        set("nick", HIW "关夫子" NOR);
        set("shen_type", 1);

        set("gender", "男性");
        set("age", 35);
        set("long",
                "\n只见他长长的胡子飘在胸前，模样甚是威严。因此人称关夫子。\n");

        set_skill("unarmed", 60);
        set_skill("dodge", 70);
        set_skill("parry", 70);
        set_skill("sword", 80);
        set_skill("force", 70);
        set_skill("huashan-xinfa", 50);
        set_skill("huashan-jian", 70);
        set_skill("huashan-shenfa",60);
        map_skill("dodge", "huashan-shenfa");
        map_skill("parry", "huashan-jian");
        map_skill("sword", "huashan-jian");
        map_skill("force", "huashan-xinfa");

        set_temp("apply/attack", 35);
        set_temp("apply/attack", 35);
        set_temp("apply/damage", 25);

        set("combat_exp", 50000);
        set("attitude", "friendly");
        set("chat_chance", 1);
        set("chat_msg", ({
        "关安基忽然说：本堂的香主谁来当，还轮不到我说话。\n",
        "关安基忽然说：唉，我的脾气不大好，大家可要小心了。\n",
        }));
        set("inquiry", ([
                "陈近南" :  "\n想见总舵主可不容易啊。\n",
                "天地会" :  "\n只要是英雄好汉，都可以入我天地会(join tiandihui)。\n",
                "加入" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "入会" :  "\n只要入了我天地会，大家就可以一起反青复明。\n",
                "反清复明" : "去屠宰场和棺材店仔细瞧瞧吧！\n",
                "威望" :  (: ask_weiwang :),
                "江湖威望" : (: ask_weiwang :),
       ]) );

        setup();
        carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/weapon/changjian")->wield();
}


void init()
{
add_action("do_join","join");
}

void die()
{
message_vision("\n$N大怒道：“你敢砍老子！兄弟们会替我报仇的！”说完倒地死了。\n", this_object());
::die();
}

int ask_weiwang()
{
command("tell "+this_player()->query("id")+" 你现在的江湖威望是 " +(string)(this_player()->query("weiwang")));
say("\n关安基说：如果你威望值很高，有些人见了你不但不会杀你，还会教你武功，送你宝贝。\n"
+"而且你还可以加入帮会，率领会众去攻打目标，就连去钱庄取钱也会有利息 。。。。。\n");
say("关安基又说：杀某些坏人或救某些好人可以提高江湖威望。\n");
return 1;
}
#include "/kungfu/class/yunlong/tiandihui.h";

