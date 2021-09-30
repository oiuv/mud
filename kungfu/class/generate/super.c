// chan_cler qm的超级npc

inherit NPC;

private void from_jiuyin();
private void from_jiuyang();
private void from_liumai();
private void from_taixuan();
private void from_jiujian();
private void from_kuihua();
private void from_jiuyin1();
private void from_pixie();
private void from_xianglong();
private void from_lingbo();
private void from_hubo();

function *init_family = ({ (: from_jiuyin :),   (: from_jiuyang :),   (: from_liumai :),
                           (: from_taixuan :),   (: from_jiujian :),   (: from_kuihua :),
                           (: from_pixie :),      (: from_jiuyin1 :),   (: from_xianglong :),
                           (: from_lingbo :),    (: from_hubo :), });
void create()
{
        NPC_D->generate_cn_name(this_object());
        set("long", "一个人。\n");
        set("gender", "男性");
        set("age", 20);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);

        // the follow 5 setting has no use
        set("max_qi", 100);
        set("max_jing", 100);
        set("neili", 100);
        set("max_neili", 100);
        set("jiali", 100);

        set("combat_exp", 3000000);

        setup();

        evaluate(init_family[random(sizeof(init_family))]);
}

private void from_jiuyin()
{
        set("scale", 200);
        set("from", ({
                "此人看似一个江湖浪人。",
        }));

        set_skill("force", 1);
        set_skill("jiuyin-shengong", 1);
        set_skill("parry", 1);
        set_skill("dodge", 1);
        set_skill("strike", 1);
        set_skill("hand", 1);
        set_skill("cuff", 1);
        set_skill("claw", 1);
        set_skill("unarmed", 1);
        set_skill("whip", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);
        set_skill("taoism", 1);

        map_skill("parry", "jiuyin-shengong");
        map_skill("force", "jiuyin-shengong");
        map_skill("dodge", "jiuyin-shengong");
        map_skill("strike", "jiuyin-shengong");
        map_skill("unarmed", "jiuyin-shengong");
        map_skill("hand", "jiuyin-shengong");
        map_skill("cuff", "jiuyin-shengong");
        map_skill("claw", "jiuyin-shengong");
        map_skill("whip", "jiuyin-shengong");
        map_skill("unarmed", "jiuyin-shengong");

        prepare_skill("unarmed", "jiuyin-shengong");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.zhua" :),
                (: perform_action, "unarmed.zhang" :),
                (: perform_action, "unarmed.quan" :),
                (: perform_action, "unarmed.shou" :),
                (: perform_action, "unarmed.zhi" :),
                (: perform_action, "xin" :),
                (: perform_action, "whip.zhen" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        set("class", "taoist");

        carry_object("/clone/weapon/changbian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
}

private void from_jiuyang()
{
        set("scale", 150);
        set("from", ({
                "据说此人出自少林。"
        }));

        set_skill("force", 1);
        set_skill("jiuyang-shengong", 1);
        set_skill("parry", 1);
        set_skill("dodge", 1);
        set_skill("sword", 1);
        set_skill("blade", 1);
        set_skill("unarmed", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("parry", "jiuyang-shengong");
        map_skill("force", "jiuyang-shengong");
        map_skill("dodge", "zhuangzi-wu");
        map_skill("sword", "jiuyang-shengong");
        map_skill("blade", "jiuyang-shengong");
        map_skill("unarmed", "jiuyang-shengong");

        prepare_skill("unarmed", "jiuyang-shengong");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.po" :),
                (: perform_action, "unarmed.ri" :),
                (: perform_action, "unarmed.hun" :),
                (: perform_action, "unarmed.jiu" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: exert_function, "recover" :),
        }) );

        set("class", "bonze");

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

private void from_liumai()
{
        set("scale", 130);
        set("from", ({
                "据说此人出自大理段家。",
        }));

        set_skill("force", 1);
        set_skill("parry", 1);
        set_skill("dodge", 1);
        set_skill("finger", 1);
        set_skill("liumai-shenjian", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("parry", "liumai-shenjian");
        map_skill("force", "kurong-changong");
        map_skill("dodge", "tiannan-bu");
        map_skill("finger", "liumai-shenjian");

        prepare_skill("finger", "liumai-shenjian");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "finger.qi" :),
                (: perform_action, "finger.six" :),
                (: perform_action, "finger.zong" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        set("class", "fighter");

        carry_object("/clone/cloth/cloth")->wear();
}

private void from_taixuan()
{
        set("scale", 130);

        set_skill("force", 1);
        set_skill("parry", 1);
        set_skill("dodge", 1);
        set_skill("sword", 1);
        set_skill("unarmed", 1);
        set_skill("taixuan-gong", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "taixuan-gong");
        map_skill("parry", "taixuan-gong");
        map_skill("dodge", "taixuan-gong");
        map_skill("unarmed", "taixuan-gong");
        map_skill("sword", "taixuan-gong");

        prepare_skill("unarmed", "taixuan-gong");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.xuan" :),
                (: perform_action, "unarmed.hun" :),
                (: perform_action, "unarmed.po" :),
                (: perform_action, "sword.jing" :),
                (: perform_action, "sword.xuan" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: exert_function, "recover" :),
        }) );

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

private void from_jiujian()
{
        set("scale", 120);
        set("from", ({
                "据说此人原是华山长老。"
        }));

        set_skill("force", 1);
        set_skill("sword", 1);
        set_skill("parry", 1);
        set_skill("dodge", 1);
        set_skill("cuff", 1);
        set_skill("poyu-quan", 1);
        set_skill("huashan-shenfa", 1);
        set_skill("dugu-jiujian", 1);
        set_skill("zixia-shengong", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "zixia-shengong");
        map_skill("parry", "dugu-jiujian");
        map_skill("dodge", "huashan-shenfa");
        map_skill("sword", "dugu-jiujian");
        map_skill("cuff", "poyu-quan");

        prepare_skill("cuff", "poyu-quan");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
                (: perform_action, "sword.po" :),
                (: perform_action, "sword.qi" :),
                (: perform_action, "sword.yi" :),
        }) );

        set("class", "begger");

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

private void from_kuihua()
{
        set("scale", 135);
        set("from", ({
                "据说此人是日月神教的长老。",
        }));

        set_skill("force", 1);
        set_skill("dodge", 1);
        set_skill("parry", 1);
        set_skill("sword", 1);
        set_skill("unarmed", 1);
        set_skill("kuihua-mogong", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "kuihua-mogong");
        map_skill("dodge", "kuihua-mogong");
        map_skill("parry", "kuihua-mogong");
        map_skill("sword", "kuihua-mogong");
        map_skill("unarmed", "kuihua-mogong");

        prepare_skill("unarmed" , "kuihua-mogong");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "sword.bian" :),
                (: perform_action, "sword.qiong" :),
                (: perform_action, "sword.sheng" :),
                (: perform_action, "sword.tian" :),
                (: perform_action, "sword.wswd" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: exert_function, "recover" :),
        }));

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

private void from_jiuyin1()
{
        set("scale", 130);
        set("from", ({
                "据说此人是古墓的长老。",
        }));

        set_skill("force", 1);
        set_skill("parry", 1);
        set_skill("dodge", 1);
        set_skill("claw", 1);
        set_skill("unarmed", 1);
        set_skill("strike", 1);
        set_skill("whip", 1);
        set_skill("yijin-duangu", 1);
        set_skill("shexing-lifan", 1);
        set_skill("jiuyin-baiguzhao", 1);
        set_skill("cuixin-zhang", 1);
        set_skill("dafumo-quan", 1);
        set_skill("yinlong-bian", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "yijin-duangu");
        map_skill("whip", "yinlong-bian");
        map_skill("dodge", "shexing-lifan");
        map_skill("parry", "dafumo-quan");
        map_skill("unarmed", "dafumo-quan");
        map_skill("strike", "cuixin-zhang");
        map_skill("claw", "jiuyin-baiguzhao");

        prepare_skill("claw", "jiuyin-baiguzhao");
        prepare_skill("strike", "cuixin-zhang");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
                (: perform_action, "strike.cui" :),
                (: perform_action, "claw.duo" :),
                (: perform_action, "claw.zhua" :),
                (: perform_action, "whip.zhu" :),
        }) );

        carry_object("/clone/weapon/changbian")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

private void from_xianglong()
{
        set("scale", 130);
        set("from", ({
                "据说此人是丐帮的长老。",
        }));

        set_skill("force", 1);
        set_skill("dodge", 1);
        set_skill("strike", 1);
        set_skill("parry", 1);
        set_skill("xianglong-zhang", 1);
        set_skill("yijin-duangu", 1);
        set_skill("feiyan-zoubi", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "yijin-duangu");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("strike", "xianglong-zhang");
        map_skill("parry", "xianglong-zhang");

        prepare_skill("strike", "xianglong-zhang");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "strike.hui" :),
                (: perform_action, "strike.qu" :),
                (: perform_action, "strike.zhen" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        carry_object("/clone/misc/cloth")->wear();
}

private void from_pixie()
{
        set("scale", 135);
        set("gender", "无性" );
        set("from", ({
                "据说此人是嵩山的长老。",
        }));

        set_skill("force", 1);
        set_skill("hanbing-zhenqi", 1);
        set_skill("pixie-jian", 1);
        set_skill("feiyan-zoubi", 1);
        set_skill("dodge", 1);
        set_skill("unarmed", 1);
        set_skill("sword", 1);
        set_skill("parry", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "zixia-shengong");
        map_skill("dodge", "pixie-jian");
        map_skill("sword", "pixie-jian");
        map_skill("unarmed", "pixie-jian");
        map_skill("parry", "pixie-jian");

        prepare_skill("unarmed","pixie-jian");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.gui" :),
                //(: perform_action, "sword.duo" :),
                (: perform_action, "sword.gui" :),
                (: perform_action, "sword.pi" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "freezing" :),
        }));

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

private void from_lingbo()
{
        set("scale", 135);
        set("from", ({
                "据说此人是逍遥的长老。",
        }));

        set_skill("force", 1);
        set_skill("dodge", 1);
        set_skill("hand", 1);
        set_skill("strike", 1);
        set_skill("parry", 1);
        set_skill("liuyang-zhang", 1);
        set_skill("zhemei-shou", 1);
        set_skill("beiming-shengong", 1);
        set_skill("lingbo-weibu", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "beiming-shengong");
        map_skill("dodge", "lingbo-weibu");
        map_skill("strike", "liuyang-zhang");
        map_skill("hand", "zhemei-shou");
        map_skill("parry", "zhemei-shou");

        prepare_skill("hand","zhemei-shou");
        prepare_skill("strike","liuyang-zhang");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "strike.po" :),
                (: perform_action, "strike.zhong" :),
                (: perform_action, "hand.hai" :),
                (: perform_action, "hand.hua" :),
                (: perform_action, "hand.zhe" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }));

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

private void from_hubo()
{
        set("scale", 135);
        set("from", ({
                "据说此人是全真的长老。",
        }));

        set_skill("force", 1);
        set_skill("yijin-duangu", 1);
        set_skill("shexing-lifan", 1);
        set_skill("jinguan-yusuo", 1);
        set_skill("kongming-quan", 1);
        set_skill("jinguan-yusuo", 1);
        set_skill("dodge", 1);
        set_skill("unarmed", 1);
        set_skill("parry", 1);
        set_skill("literate", 1);
        set_skill("martial-cognize", 1);

        map_skill("force", "yijin-duangu");
        map_skill("dodge", "shexing-lifan");
        map_skill("parry", "jinguan-yusuo");
        map_skill("unarmed", "kongming-quan");

        prepare_skill("unarmed", "kongming-quan");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: command("perform unarmed.ruo and unarmed.kong") :),
                (: command("perform parry.suo and unarmed.kong") :),
                (: command("perform unarmed.kong twice") :),
                (: perform_action, "dodge.guiyuan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        carry_object("/clone/misc/cloth")->wear();
}
