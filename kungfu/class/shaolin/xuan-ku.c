
inherit NPC;
inherit F_MASTER;

string ask_me();

#include "xuan-ku.h"

void create()
{
        set_name("Ğş¿à´óÊ¦", ({
                "xuanku dashi",
                "xuanku",
                "dashi",
        }));
        set("long",
                "ËûÊÇÒ»Î»°×Ğë°×Ã¼µÄÀÏÉ®£¬Éí´©Ò»Ï®ÒøË¿×Ø»ÆôÂôÄ¡£ËûÉí²ÄÊİ¸ß£¬\n"
                "Á³ÉÏÂú²¼ÖåÎÆ£¬ÊÖ±Û´¦Çà½îÕÀÂ¶£¬ËÆºõ¾Ã¾­·çËª¡£\n"
        );


        set("nickname", "ÂŞººÌÃÊ××ù");
        set("gender", "ÄĞĞÔ");
        set("attitude", "friendly");
        set("class", "bonze");

        set("age", 70);
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 2400);
        set("max_jing", 1000);
        set("neili", 3200);
        set("max_neili", 3200);
        set("jiali", 50);
        set("combat_exp", 1050000);

        set_skill("force", 180);
        set_skill("hunyuan-yiqi", 180);
        set_skill("shaolin-xinfa", 180);
        set_skill("dodge", 180);
        set_skill("shaolin-shenfa", 180);
        set_skill("parry", 180);
        set_skill("cuff", 180);
        set_skill("staff", 180);
        set_skill("blade", 180);
        set_skill("sword", 180);
        set_skill("luohan-quan", 180);
        set_skill("weituo-gun", 180);
        set_skill("xiuluo-dao", 180);
        set_skill("fumo-jian", 180);
        set_skill("buddhism", 200);
        set_skill("literate", 200);
        set_skill("medical", 200);
        set_skill("shaolin-yishu", 200);


        set_skill("hongye-daofa",180);
//      set_skill("tiezhu-juedao",180);
        set_skill("jiechen-dao",180);
        
        set_skill("huilong-zhang",180);
        set_skill("weituo-chu",180);
        
        set_skill("qingliang-jian",180);
        set_skill("luohan-jian",180);
        
        set_skill("club",180);
        set_skill("yecha-gun",180);
        set_skill("luohan-gun",180);
        set_skill("zui-gun",180);
        
        set_skill("whip",180);
        set_skill("dacheng-fosuo",180);
        set_skill("qingyun-bian",180);
        set_skill("leiming-bian",180);
        set_skill("liuhe-bian",180);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("parry", "luohan-quan");
        map_skill("cuff", "luohan-quan");
        map_skill("staff", "weituo-gun");
        map_skill("blade", "xiuluo-dao");
        map_skill("sword", "fumo-jian");

        prepare_skill("cuff", "luohan-quan");

        create_family("ÉÙÁÖÅÉ", 36, "µÜ×Ó");

        set("inquiry", ([
                "Ê®°ËÂŞººÕó"       : (: ask_me :),
                "ÂŞºº´óÕó"         : (: ask_me :)
        ]));

        setup();

        carry_object("/d/shaolin/obj/jiedao")->wield();
        carry_object("/d/shaolin/obj/xuan-cloth")->wear();
}


