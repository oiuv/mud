#include <ansi.h> 
 
inherit SHAOLIN_SKILL; 

mapping *action = ({ 
<<<<<<< HEAD
([      "action":"$NÒ»ÕĞ"HIR" ¾Û»ğ "NOR",ÊÖÑï±ŞÆğ£¬ÊÖÖĞ$w½«$nÍÅÍÅÎ§×¡£¬ÄÚÁ¦Ò»ÍÂ£¬±ŞÈ¦ÔÈËÙËõĞ¡¡£", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -10, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "¾Û»ğ", 
        "damage_type":  "ÄÚÉË" 
]), 
([      "action":"$N×óÊÖĞé»Ã£¬ÓÒÊÖ$wÒ»ÕĞ"HIC" Æğ¹â "NOR",ÊÖÖĞ$wÓÉËÆÒ»ÌõÇàÁúÑ¸ËÙ»÷Ïò$n¡£", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        5, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "Æğ¹â", 
        "damage_type":  "´ÌÉË" 
]), 
([      "action":"$NÌÚ¿Õ¶øÆğ£¬ÊÖÖĞ$wÎè³ÉÔ²»·£¬Ò»ÕĞ"HIB" ÕĞÓê "NOR"Ñ¹Ïò$n,Áî$nÎŞ´¦¿É¶ã¡£", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        10, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "ÕĞÓê", 
        "damage_type":  "ÄÚÉË" 
]), 
([      "action":"$NÁ¦¹á±ŞÉÒ£¬Ò»ÕĞ"HIR" ¶¯À× "NOR"£¬ÊÖÖĞ$wÎè³öÂúÌì±ŞÓ°£¬ÅÅÉ½µ¹º£°ãÉ¨Ïò$nÈ«Éí", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -5, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "¶¯À×", 
        "damage_type":  "ÓÙÉË" 
]), 
([      "action":"$NÍùÇ°Ò»×İ, µ«¼û$NÉíĞÎÒ»×ª£¬Ò»ÕĞ"HIC" ÒÆµç "NOR"£¬ÊÖÖĞ$wÈç¹í÷ÈÒ»°ã£¬Éñ²»Öª¹í²»¾õµØÏ®Ïò$nµÄ$l£¡", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -10, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "ÒÆµç", 
        "damage_type":  "´ÌÉË" 
]), 
([      "action":"$NÊÖ³Ö$w,Á¦¹á±ŞÉÔ£¬Ò»ÕĞ"HIR" ¼ôºç "NOR"ÊÖÖĞ$wÓÌÈç²Êºç°ã»÷Ïò$n,ÒÑ½«$nÁıÕÖÓÚ±ŞÏÂ¡£", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -20, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name":  "¼ôºç", 
]), 
([      "action":"$N×óÊÖĞé»Î£¬ÓÒ½ÅÍ»È»ÏòÇ°Âõ³ö£¬Ò»ÕĞ"CYN" Ö¹·ç "NOR"£¬ÓÒÊÖ$wÈçÍ¬¹í÷ÈÒ»°ãÎŞÉùÎŞÏ¢µÄ´ÌÏò$n!", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        0, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "Ö¹·ç", 
        "damage_type":  "´ÌÉË" 
]), 
([      "action":"$NÏòÇ°×İ³ö£¬ÉíÌå·É¹ı$nÍ·¶¥£¬Ò»ÕĞ"HIW" ¶ÏÔÆ "NOR"ÊÖÖĞ$w»÷Ïò$nµÄ$l", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        100, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "¶ÏÔÆ", 
        "damage_type":  "ÄÚÉË" 
]), 
([      "action":"$NÊÖÖĞ$w»Î³öÂúÌì±ŞÓ°£¬Ò»ÕĞ"HIB" ÕÚÔÂ "NOR"ĞéĞéÊµÊµµÄ±ŞÓ°£¬ÆÌÌì¸ÇµØµÄ»÷Ïò$n", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        50, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "ÕÚÔÂ", 
        "damage_type":  "ÓÙÉË" 
]), 
([      "action":"$NÒ»ÕĞ"YEL" ÑÚÈÕ "NOR"ÊÖÖĞ$wĞÎËÆòÔÁúÓÖËÆ·É»È,ÃÜ²»Í¸·çµÄÕÖÏò$n£¡", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        40, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "ÑÚÈÕ", 
        "damage_type":  "ÓÙÉË" 
=======
([      "action":"$Nä¸€æ‹›"HIR" èšç« "NOR",æ‰‹æ‰¬é­èµ·ï¼Œæ‰‹ä¸­$wå°†$nå›¢å›¢å›´ä½ï¼Œå†…åŠ›ä¸€åï¼Œé­åœˆåŒ€é€Ÿç¼©å°ã€‚", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -10, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "èšç«", 
        "damage_type":  "å†…ä¼¤" 
]), 
([      "action":"$Nå·¦æ‰‹è™šå¹»ï¼Œå³æ‰‹$wä¸€æ‹›"HIC" èµ·å…‰ "NOR",æ‰‹ä¸­$wç”±ä¼¼ä¸€æ¡é’é¾™è¿…é€Ÿå‡»å‘$nã€‚", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        5, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "èµ·å…‰", 
        "damage_type":  "åˆºä¼¤" 
]), 
([      "action":"$Nè…¾ç©ºè€Œèµ·ï¼Œæ‰‹ä¸­$wèˆæˆåœ†ç¯ï¼Œä¸€æ‹›"HIB" æ‹›é›¨ "NOR"å‹å‘$n,ä»¤$næ— å¤„å¯èº²ã€‚", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        10, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "æ‹›é›¨", 
        "damage_type":  "å†…ä¼¤" 
]), 
([      "action":"$NåŠ›è´¯é­æ¢¢ï¼Œä¸€æ‹›"HIR" åŠ¨é›· "NOR"ï¼Œæ‰‹ä¸­$wèˆå‡ºæ»¡å¤©é­å½±ï¼Œæ’å±±å€’æµ·èˆ¬æ‰«å‘$nå…¨èº«", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -5, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "åŠ¨é›·", 
        "damage_type":  "æ·¤ä¼¤" 
]), 
([      "action":"$Nå¾€å‰ä¸€çºµ, ä½†è§$Nèº«å½¢ä¸€è½¬ï¼Œä¸€æ‹›"HIC" ç§»ç”µ "NOR"ï¼Œæ‰‹ä¸­$wå¦‚é¬¼é­…ä¸€èˆ¬ï¼Œç¥ä¸çŸ¥é¬¼ä¸è§‰åœ°è¢­å‘$nçš„$lï¼", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -10, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "ç§»ç”µ", 
        "damage_type":  "åˆºä¼¤" 
]), 
([      "action":"$Næ‰‹æŒ$w,åŠ›è´¯é­ç¨ï¼Œä¸€æ‹›"HIR" å‰ªè™¹ "NOR"æ‰‹ä¸­$wçŠ¹å¦‚å½©è™¹èˆ¬å‡»å‘$n,å·²å°†$nç¬¼ç½©äºé­ä¸‹ã€‚", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        -20, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name":  "å‰ªè™¹", 
]), 
([      "action":"$Nå·¦æ‰‹è™šæ™ƒï¼Œå³è„šçªç„¶å‘å‰è¿ˆå‡ºï¼Œä¸€æ‹›"CYN" æ­¢é£ "NOR"ï¼Œå³æ‰‹$wå¦‚åŒé¬¼é­…ä¸€èˆ¬æ— å£°æ— æ¯çš„åˆºå‘$n!", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        0, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "æ­¢é£", 
        "damage_type":  "åˆºä¼¤" 
]), 
([      "action":"$Nå‘å‰çºµå‡ºï¼Œèº«ä½“é£è¿‡$nå¤´é¡¶ï¼Œä¸€æ‹›"HIW" æ–­äº‘ "NOR"æ‰‹ä¸­$wå‡»å‘$nçš„$l", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        100, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "æ–­äº‘", 
        "damage_type":  "å†…ä¼¤" 
]), 
([      "action":"$Næ‰‹ä¸­$wæ™ƒå‡ºæ»¡å¤©é­å½±ï¼Œä¸€æ‹›"HIB" é®æœˆ "NOR"è™šè™šå®å®çš„é­å½±ï¼Œé“ºå¤©ç›–åœ°çš„å‡»å‘$n", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        50, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "é®æœˆ", 
        "damage_type":  "æ·¤ä¼¤" 
]), 
([      "action":"$Nä¸€æ‹›"YEL" æ©æ—¥ "NOR"æ‰‹ä¸­$wå½¢ä¼¼è›Ÿé¾™åˆä¼¼é£è—,å¯†ä¸é€é£çš„ç½©å‘$nï¼", 
        "force":        (int)this_player()->query("max_neili")/4, 
        "dodge":        40, 
        "damage":       (int)this_player()->query("shen")/1500, 
        "skill_name" : "æ©æ—¥", 
        "damage_type":  "æ·¤ä¼¤" 
>>>>>>> 12f807c31d53cdb29bd289c27c5268e826337935
]), 
}); 
     
int valid_enable(string usage) { return (usage == "whip") || (usage == "parry"); } 
         
int valid_learn(object me) 
{ 
        object weapon; 
        int lvl = (int)me->query_skill("qingyun-bian", 1); 
        int t = 1, j; 
        if( (int)me->query("max_neili") < 500 ) 
                return notify_fail("ä½ çš„å†…åŠ›ä¸è¶³ï¼Œæ²¡æœ‰åŠæ³•ç»ƒé’äº‘é­æ³•, å¤šç»ƒäº›å†…åŠ›å†æ¥å§ã€‚\n"); 
 
        if ((int)me->query_skill("shaolin-xinfa", 1) < 80) 
                return notify_fail("ä½ çš„å°‘æ—å¿ƒæ³•ç«å€™å¤ªæµ…ã€‚\n"); 
         
        if ( !objectp(weapon = me->query_temp("weapon")) 
                || ( string)weapon->query("skill_type") != "whip" ) 
                return notify_fail("ä½ å¿…é¡»å…ˆæ‰¾ä¸€æ¡é­å­æ‰èƒ½ç»ƒé­æ³•ã€‚\n"); 
        
         if(lvl<=150) 
        { 
                if (lvl > 10 && (int)me->query("shen") < t * 20) 
                        return notify_fail("ä½ çš„æ­£æ°”å¤ªä½äº†ã€‚\n"); 
        } 
        else 
        { 
                if ((int)me->query("shen") < (11100 + (lvl - 100) * 1000))  
                        return notify_fail("ä½ çš„æ­£æ°”å¤ªä½äº†ã€‚\n"); 
        } 
        return 1; 
} 
         
string query_skill_name(int level) 
{ 
        int i; 
        for(i = sizeof(action)-1; i >= 0; i--) 
                if(level >= action[i]["lvl"]) 
                        return action[i]["skill_name"]; 
} 
         
mapping query_action(object me, object weapon) 
{ 
        int i, level; 
        level   = (int) me->query_skill("qingyun-bian", 1); 
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
 
int practice_skill(object me) 
{ 
        object weapon; 
         
        if (!objectp(weapon = me->query_temp("weapon")) 
                || (string)weapon->query("skill_type") != "whip") 
                return notify_fail("ä½ ä½¿ç”¨çš„æ­¦å™¨ä¸å¯¹ã€‚\n"); 
        if ((int)me->query("qi") < 50) 
                return notify_fail("ä½ çš„ä½“åŠ›ä¸å¤Ÿç»ƒé’äº‘é­æ³•ã€‚\n"); 
        me->receive_damage("qi", 30); 
        return 1; 
} 
         
string perform_action_file(string action) 
{ 
                return __DIR__"qingyun-bian/" + action; 
} 
