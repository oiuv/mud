// Npc: /kungfu/class/shaolin/cheng-xin2.c
// Date: YZC 96/01/19

#include <ansi.h>
inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("澄信", ({
                "chengxin luohan",
                "chengxin",
                "zhuangyan",
                "luohan",
        }));
        set("long",
                "他是一位须发花白的老僧，身穿一袭金边黑布袈裟。他身材瘦高，\n"
                "太阳穴高高鼓起，似乎身怀绝世武功。\n"
        );

        set("title",YEL"少林般若堂座下"+HIY" 庄严罗汉"NOR);
        set("gender", "男性");
        set("attitude", "friendly");
        set("class", "bonze");

        set("age", 60);
        set("shen_type", 1);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
        set("max_qi", 1000);
        set("max_jing", 1000);
        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 100);
        set("combat_exp", 100000);
        set("score", 5000);

        set_skill("force", 85);
        set_skill("hunyuan-yiqi", 85);
        set_skill("shaolin-xinfa", 85);
        set_skill("dodge", 85);
        set_skill("shaolin-shenfa", 85);
        set_skill("blade", 95);
        set_skill("xiuluo-dao", 90);
        set_skill("parry", 85);
        set_skill("buddhism", 85);
        set_skill("literate", 85);
        set_skill("hongye-daofa",80);
//      set_skill("tiezhu-juedao",80);
        set_skill("jiechen-dao",80);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("blade", "xiuluo-dao");
        map_skill("parry", "xiuluo-dao");

        create_family("少林派", 37, "弟子");

        setup();

        carry_object("/d/shaolin/obj/jiedao")->wield();
        carry_object("/d/shaolin/obj/cheng-cloth")->wear();
}

#include "/kungfu/class/shaolin/cheng.h"


