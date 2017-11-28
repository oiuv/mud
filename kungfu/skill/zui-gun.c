// zui-gun.c -ÉÙÁÖ×í¹÷
// modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "¡¸À¶²ÉºÍ£¬ÌáÀºÈ°¾Æ×íëüëÊ¡¹£¬$NÊÖÖÐ$w°ëÌá£¬»º»º»®Ïò$nµÄ$l",    
        "force" : 110,
        "attack": 10,
        "dodge" : 0,
        "parry" : 5,
        "damage": 10,
        "lvl"   : 10,
        "skill_name" : "À¶²ÉºÍ£¬ÌáÀºÈ°¾Æ×íëüëÊ",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸ºÎÏÉ¹Ã£¬À¹Ñü¾´¾Æ×íÏÉ²½¡¹£¬$N×óÕÆ»¤ÐØ£¬ÓÒ±ÛÐ®¹÷ÃÍµØÉ¨Ïò$nµÄÑü¼ä",
        "force" : 130,
        "attack": 24,
        "dodge" : 5,
        "parry" : 10,
        "damage": 15,
        "lvl"   : 20,
        "skill_name" : "ºÎÏÉ¹Ã£¬À¹Ñü¾´¾Æ×íÏÉ²½",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸²Ü¹ú¾Ë£¬Ç§±­²»×íµ¹½ðÖÑ¡¹£¬$Nµ¹Êú$w£¬Ö¸Ìì´òµØ£¬Ïò$nµÄ$lÅüÈ¥",
        "force" : 150,
        "attack": 32,
        "dodge" : 5,
        "parry" : 5,
        "damage": 20,
        "lvl"   : 30,
        "skill_name" : "²Ü¹ú¾Ë£¬Ç§±­²»×íµ¹½ðÖÑ",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸º«Ïæ×Ó£¬Ìú¹÷ÌáÐØ×í°ÎÏô¡¹£¬$NºáÌá$w£¬¹÷¶Ë»®ÁË¸ö°ëÈ¦£¬»÷Ïò$nµÄ$l",
        "force" : 180,
        "attack": 41,
        "dodge" : 5,
        "parry" : 5,
        "damage": 25,
        "lvl"   : 40,
        "skill_name" : "º«Ïæ×Ó£¬Ìú¹÷ÌáÐØ×í°ÎÏô",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸ººÖÓÀë£¬µø²½·­Éí×íÅÌÁú¡¹£¬$NÊÖÖÐ¹÷»¨ÍÅÍÅ£¬¼²·ç°ãÏò¾íÏò$n",  
        "force" : 220,
        "attack": 42,
        "dodge" : 10,
        "parry" : 15,
        "damage": 30,
        "lvl"   : 60,
        "skill_name" : "ººÖÓÀë£¬µø²½·­Éí×íÅÌÁú",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸Ìú¹ÕÀî£¬Ìßµ¹½ðÉ½×íÓñ³Ø¡¹£¬$Nµ¥ÍÈÖ§µØ£¬Ò»ÍÈÒ»¹÷ÆëÆë»÷Ïò$nµÄ$l",
        "force" : 260,
        "attack": 47,
        "dodge" : 5,
        "parry" : 15,
        "damage": 35,
        "lvl"   : 80,
        "skill_name" : "Ìú¹ÕÀî£¬Ìßµ¹½ðÉ½×íÓñ³Ø",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸ÕÅ¹ûÀÏ£¬×í¾ÆÅ×±­µ¹ÆïÂ¿¡¹£¬$NÅ¤Éí·´±³£¬$w´Ó¿èµ××ê³ö£¬´ÁÏò$nµÄÐØ¿Ú",
        "force" : 290,
        "attack": 52,
        "dodge" : 5,
        "parry" : 20,
        "damage": 40,
        "lvl"   : 100,
        "skill_name" : "ÕÅ¹ûÀÏ£¬×í¾ÆÅ×±­µ¹ÆïÂ¿",
        "damage_type": "´ìÉË"
]),
([      "action": "¡¸ÂÀ¶´±ö£¬¾Æ×íÌáºøÁ¦Ç§¾û¡¹£¬$NÌÚ¿Õ¶øÆð£¬ÈçÉ½¹÷Ó°£¬¼²¼²Ñ¹Ïò$n",
        "force" : 310,
        "attack": 54,
        "dodge" : 10,
        "parry" : 25,
        "damage": 50,
        "lvl"   : 120,
        "skill_name" : "ÂÀ¶´±ö£¬¾Æ×íÌáºøÁ¦Ç§¾û",
        "damage_type": "´ìÉË"
]),
});

int valid_enable(string usage) { return usage == "club" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 250)
                return notify_fail("ÄãµÄÄÚÁ¦²»¹»¡£\n");

        if ((int)me->query_skill("force") < 50)
                return notify_fail("ÄãµÄÄÚ¹¦»ðºòÌ«Ç³¡£\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("zui-gun", 1))
                return notify_fail("ÄãµÄ»ù±¾¹÷·¨Ë®Æ½ÓÐÏÞ£¬ÎÞ·¨Áì»á¸ü¸ßÉîµÄ×í¹÷¡£\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("zui-gun", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "club")
                return notify_fail("ÄãÊ¹ÓÃµÄÎäÆ÷²»¶Ô¡£\n");

        if ((int)me->query("qi") < 65)
                return notify_fail("ÄãµÄÌåÁ¦²»¹»Á·ÉÙÁÖ×í¹÷¡£\n");

        if ((int)me->query("neili") < 65)
                return notify_fail("ÄãµÄÄÚÁ¦²»¹»Á·ÉÙÁÖ×í¹÷¡£\n");

        me->receive_damage("qi", 58);
        me->add("neili", -54);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zui-gun/" + action;
}
