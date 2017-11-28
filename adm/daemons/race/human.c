// human.c

#define BASE_WEIGHT 40000

inherit F_DBASE;
inherit F_SKILL;

mapping *combat_action = ({
([      "action":               "$N挥拳攻击$n的$l",
        "damage_type":  "瘀伤",
]),
([      "action":               "$N往$n的$l一抓",
        "damage_type":  "抓伤",
]),
([      "action":               "$N往$n的$l狠狠地踢了一脚",
        "damage_type":  "瘀伤",
]),
([      "action":               "$N提起拳头往$n的$l捶去",
        "damage_type":  "瘀伤",
]),
([      "action":               "$N对准$n的$l用力挥出一拳",
        "damage_type":  "瘀伤",
]),
});

void create()
{
        seteuid(getuid());
}

void setup_human(object ob)
{
        mapping my;
        int s;
        int f, x, y;

        my = ob->query_entire_dbase();
        f = (int)ob->query_skill("force", 1);

        ob->set_default_action(__FILE__, "query_action");
        if (! stringp(my["unit"])) my["unit"] = "位";
        if (! stringp(my["gender"])) my["gender"] = "男性";
        if (undefinedp(my["can_speak"])) my["can_speak"] = 1;
        if (! stringp(my["attitude"])) my["attitude"] = "peaceful";
        if (! pointerp(my["limbs"])) my["limbs"] = ({
                "头部", "颈部", "胸口", "后心", "左肩", "右肩", "左臂",
                "右臂", "左手", "右手", "腰间", "小腹", "左腿", "右腿",
                "左脚", "右脚"
        });

        if (undefinedp(my["age"])) my["age"] = 14;
        if (undefinedp(my["str"])) my["str"] = 10 + random(21);
        if (undefinedp(my["con"])) my["con"] = 10 + random(21);
        if (undefinedp(my["dex"])) my["dex"] = 10 + random(21);
        if (undefinedp(my["int"])) my["int"] = 10 + random(21);
        if (undefinedp(my["per"])) my["per"] = 10 + random(21);

        if (userp(ob) || undefinedp(my["max_jing"]))
        {
                s = ob->query_int();
                my["max_jing"] = 100;

                if (undefinedp(my["born"]));
                else
                if (my["age"] < 14)
                        my["max_jing"] = 50 + my["age"] * s * 2 / 3;
                else
                if (my["age"] < 24)
                        my["max_jing"] += (my["age"] - 14) * s * 2 / 3;
                else
                        my["max_jing"] += (24 - 14) * s * 2 / 3;

                if ((int)my["max_jingli"] > 0)
                        my["max_jing"] += (int)my["max_jingli"] / 4;

                // 聚魄还虚提升最大精气
                if (ob->query("special_skill/energy"))
                        my["max_jing"] += 50 + f * 2;
                
                 //转世精气提升 by 薪有所属       
                if (ob->query("reborn"))
                        my["max_jing"] += my["max_jing"] / 2; 

                if (my["breakup"])
                        my["max_jing"] += my["max_jing"];

                if (my["animaout"])
                        my["max_jing"] += my["max_jing"];
        }

        if (userp(ob) || undefinedp(my["max_qi"]))
        {
                s = ob->query_con() + ob->query_str();
                my["max_qi"] = 100;

                if (undefinedp(my["born"]))
                        ; else
                if (my["age"] < 14)
                        my["max_qi"] = 60 + my["age"] * my["con"] / 2;
                else
                if (my["age"] < 27)
                        my["max_qi"] += (my["age"] - 14) * s * 2 / 3;
                else
                        my["max_qi"] += (27 - 14) * s * 2 / 3;

                if ((int)my["max_neili"] > 0)
                        my["max_qi"] += (int)my["max_neili"] / 4;
                        
                 //转世特技六阴鬼脉降低最大气血 by 薪有所属
                if (ob->query("special_skill/guimai"))
                        my["max_qi"] -= my["max_qi"]* 3 / 10;

                // 内敛乾坤提升最大气血
                if (ob->query("special_skill/health"))
                        my["max_qi"] += 80 + f * 3;
                        
                //转世气血加倍 by 薪有所属       
                  if (ob->query("reborn"))
                        my["max_qi"] += my["max_qi"]; 
                        
              
                // 九阴神功配合道学心法加气
                if ((x = (int)ob->query_skill("taoism", 1)) > 39 &&
                    (y = (int)ob->query_skill("jiuyin-shengong", 1)) > 39)
                {
                        if (x > 400) x = (x - 400) / 2 + 400;
                        if (y > 400) y = (y - 400) / 2 + 400;
                        if (x > 250) x = (x - 250) / 2 + 250;
                        if (y > 250) y = (y - 250) / 2 + 250;

                        my["max_qi"] += (x + 100 ) * (y + 100) / 100;
                } else
                // 太极神功配合道学心法加气
                if ((x = (int)ob->query_skill("taoism", 1)) > 39 &&
                    (y = (int)ob->query_skill("taiji-shengong", 1)) > 39)
                {
                        if (x > 350) x = (x - 350) / 2 + 350;
                        if (y > 350) y = (y - 350) / 2 + 350;
                        if (x > 200) x = (x - 200) / 2 + 200;
                        if (y > 200) y = (y - 200) / 2 + 200;

                        my["max_qi"] += (x + 100 ) * (y + 100) / 100;
                } else
                // 易筋锻骨配合道学心法加气
                if ((x = (int)ob->query_skill("taoism", 1)) > 39 &&
                    (y = (int)ob->query_skill("yijin-duangu", 1)) > 39)
                {
                        if (x > 320) x = (x - 320) / 2 + 320;
                        if (y > 320) y = (y - 320) / 2 + 320;
                        if (x > 180) x = (x - 180) / 2 + 180;
                        if (y > 180) y = (y - 180) / 2 + 180;

                        my["max_qi"] += (x + 100 ) * (y + 100) / 100;
                } else
                // 先天功配合道学心法加气
                if ((x = (int)ob->query_skill("taoism", 1)) > 39 &&
                    (y = (int)ob->query_skill("xiantian-gong", 1)) > 39)
                {
                        if (x > 300) x = (x - 300) / 2 + 300;
                        if (y > 300) y = (y - 300) / 2 + 300;
                        if (x > 150) x = (x - 150) / 2 + 150;
                        if (y > 150) y = (y - 150) / 2 + 150;

                        my["max_qi"] += (x + 100 ) * (y + 100) / 100;
                } else
                // 碧波神功配合碧海潮生曲加气
                if ((x = (int)ob->query_skill("bihai-chaosheng", 1)) > 39 &&
                    (y = (int)ob->query_skill("bibo-shengong", 1)) > 39)
                {
                        if (x > 250) x = (x - 250) / 2 + 250;
                        if (y > 250) y = (y - 250) / 2 + 250;
                        if (x > 120) x = (x - 120) / 2 + 120;
                        if (y > 120) y = (y - 120) / 2 + 120;

                        my["max_qi"] += (x + 100 ) * (y + 100) / 100;
                }

                if (my["breakup"])
                        my["max_qi"] += my["max_qi"];
        }

        // 为什么要乘以0.7？这是因为背人只需要70%的负重。
        if (! ob->query_weight())
                ob->set_weight((BASE_WEIGHT + (my["str"] - 10) * 2000) * 7 / 10);
}

mapping query_action()
{
        return combat_action[random(sizeof(combat_action))];
}

