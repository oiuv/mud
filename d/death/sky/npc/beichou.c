#include <ansi.h>
inherit NPC;

void create()
{
        set_name("北丑", ({ "bei chou", "bei", "chou", "xizi" }) );
        set("nickname", HIW "北戏子" NOR);
        set("title", HIC "武林泰斗" NOR);
        set("gender", "男性" );
        set("age", 68);
        set("long", HIC "这是一个身着戏子打扮的瘦小老头，长得尖\n"
                        "嘴猴腮，天生一副奸相。这便是当今武林中\n"
                        "号称「" HIR "南贤北丑" HIC "」戏子北丑。"
                        "\n" NOR);
        set("attitude", "friendly");
        set("max_jing", 25000);
        set("max_qi", 25000);
        set("max_jingli", 50000);
        set("jingli", 50000);
        set("max_neili", 50000);
        set("neili", 50000);
        set("jiali", 375);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("combat_exp", 12000000);
        /*
        set_skill("dodge", 500);
        set_skill("unarmed", 500);
        set_skill("force", 500);
        set_skill("parry", 500);
        set_skill("sword", 500);
        set_skill("poison", 500);
        set_skill("medical", 500);
        set_skill("hand", 500);
        set_skill("strike", 500);
        set_skill("staff", 500);
        set_skill("finger", 500);
        set_skill("claw", 500);
        set_skill("blade", 500);
        set_skill("pixie-jian", 500);
        set_skill("literate", 500);
        set_skill("taoism", 500);
        set_skill("buddhism", 500);
        set_skill("jiuyang-shengong", 500);
        set_skill("lingbo-weibu", 500);
        set_skill("qiankun-danuoyi", 500);
        set_skill("xuanming-zhang", 500);
        set_skill("jiuyin-baiguzhao", 500);
        set_skill("dugu-jiujian", 500);
        set_skill("six-finger", 500);
        set_skill("qianzhu-wandushou", 500);
        set_skill("ranmu-daofa", 500);
        set_skill("dagou-bang", 500);
        set_skill("shaolin-yishu", 500);
        set_skill("wudu-qishu", 500);
        set_skill("throwing", 500);
        set_skill("mantian-xing", 500);
        set_skill("idle-force", 500);

        map_skill("unarmed", "pixie-jian");
        map_skill("force", "jiuyang-shengong");
        map_skill("dodge", "lingbo-weibu");
        map_skill("parry", "qiankun-danuoyi");
        map_skill("hand", "qianzhu-wandushou");
        map_skill("strike", "xuanming-zhang");
        map_skill("claw", "jiuyin-baiguzhao");
        map_skill("finger", "six-finger");
        map_skill("sword", "dugu-jiujian");
        map_skill("blade", "ranmu-daofa");
        map_skill("staff", "dagou-bang");
        map_skill("throwing", "mantian-xing");
        map_skill("poison", "wudu-qishu");
        map_skill("medical", "shaolin-yishu");

        prepare_skill("finger", "six-finger");

        set("chat_chance_combat", 200);
        set("chat_msg_combat", ({
                (: perform_action, "sword.po" :),
                (: perform_action, "blade.zhenyan" :),
                (: perform_action, "blade.huo" :),
                (: perform_action, "staff.wugou" :),
                (: perform_action, "staff.chan" :),
                (: perform_action, "staff.ban" :),
                (: perform_action, "unarmed.cimu" :),
                (: perform_action, "parry.nuoyi" :),
                (: perform_action, "dodge.lingbo" :),
                (: perform_action, "throwing.shan" :),
                (: perform_action, "hand.zhugu" :),
                (: perform_action, "strike.wuji" :),
                (: perform_action, "finger.six" :),
                (: perform_action, "finger.zhongheng" :),
                (: perform_action, "claw.zhua" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: exert_function, "heal" :),
                (: exert_function, "dispel" :),
                (: exert_function, "regenerate" :),
        }) );
        */
        setup();
        carry_object("d/city/obj/cloth")->wear();
}
